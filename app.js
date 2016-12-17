$(window).on("orientationchange", function() {
    //alert("The orientation has changed!");
    if (window.orientation == 0) { // Portrait
        $("p").css({ "background-color": "yellow" });
    } else { //Landscape
        $("p").css({ "background-color": "pink" });
    }
});

$(document).ready(function() {
            //Initialize Firebase
            var config = {
                apiKey: "AIzaSyD5XYZHecNShIOC9c69lKZgIVPYyHyysF8",
                authDomain: "project-allergi.firebaseapp.com",
                databaseURL: "https://project-allergi.firebaseio.com",
                storageBucket: "project-allergi.appspot.com",
                messagingSenderId: "149119827295"
            };
            firebase.initializeApp(config);

            database = firebase.database();

            //LabelAPI key: x49rczhgarkyz7hzpxsez2nn
            var labelAPIkey = "x49rczhgarkyz7hzpxsez2nn";
            var walmartAPIkey = "2ahdxqdhzd7thd5u846wgf2m";
            var searchInput = '';
            var labelURL = '';


            //Check for UPCs in the page URL
            if (getQueryVariable('upc') != false) {
                getAllergens(getQueryVariable('upc'));

                $("#search-results").removeClass("displayOff");
                $("#recentSearches").removeClass("displayOff");
                database.ref().push({
                    newUpc: getQueryVariable('upc'),
                    dateAdded: firebase.database.ServerValue.TIMESTAMP
                });
            }

            database.ref().orderByChild("dateAdded").limitToLast(5).on("child_added", function(snapshot) {
                $("#new-recent-search").append("<tr><td>" + snapshot.val().newUpc + "</td></tr>");
            });


            //Click event for searching products
            $(document).on("click", "#add-product", function() {
                $(".resultPanels").addClass("displayOff");
                $("#search-results").removeClass("displayOff");
                $("#recentSearches").removeClass("displayOff");

                searchInput = $("#productInput").val().trim();
                searchURL = "http://cors-anywhere.herokuapp.com/http://api.foodessentials.com/searchprods?q=" + searchInput + "&sid=" + "3bf8bb6f-99d8-42f6-a422-3a8c37a10de8" + "&n=100&s=0&f=json&api_key=" + labelAPIkey;

                // Code for handling the push
                database.ref().push({
                    searchInput: searchInput
                });

                $("#productInput").val("");

                productSearch(searchInput);
            });

            //Function that calls API for product search
            function productSearch(productName) {
                searchURL = "http://cors-anywhere.herokuapp.com/http://api.foodessentials.com/searchprods?q=" + productName + "&sid=" + "3bf8bb6f-99d8-42f6-a422-3a8c37a10de8" + "&n=100&s=0&f=json&api_key=" + labelAPIkey;
                $.ajax({
                    url: searchURL,
                    method: 'GET'
                }).done(function(response) {


                    //Displays 100 items related to the searched product
                    if (response.productsArray) {
                        for (i = 0; i < 100; i++) {

                            var productVariable = window.location.pathname + '?upc=' + response.productsArray[i].upc;

                            $("#new-input").append("<tr><td><a href='" + productVariable + "'>" + response.productsArray[i].product_name + "</a></td></tr>");
                        }
                    }

                    if (!response.productsArray) {
                        alert("ERROR: PRODUCT NOT AVAILABLE OR MISSPELLED");
                        console.log("this should be an empty array: ")
                    }
                });


                function getQueryVariable(variable) {
                    var query = window.location.search.substring(1);
                    var vars = query.split("&");
                    for (var i = 0; i < vars.length; i++) {
                        var pair = vars[i].split("=");
                        if (pair[0] == variable) {
                            return pair[1];
                        }
                    }
                    return (false);
                }

                //Function that lists all allergens and additives of product chosen fromm productSearch function
                function getAllergens(upc) {
                    upcURL = "http://cors-anywhere.herokuapp.com/http://api.foodessentials.com/label?u=" + upc + "&sid=" + "3bf8bb6f-99d8-42f6-a422-3a8c37a10de8" + "&appid=demoApp_01&f=json" + "&api_key=" + labelAPIkey;
                    console.log(upcURL);
                    $.ajax({
                        url: upcURL,
                        method: 'GET'
                    }).done(function(upcresponse) {
                        //Show results of all allergens active in the product's ingredient
                        $(".resultPanels").removeClass("displayOff");
                        $("#search-results").addClass("displayOff");
                        $("#new-UPCInput-Allergen").empty();
                        $("#new-UPCInput-Additive").empty();
                        $("#thisProduct").empty();

                        console.log(upcresponse);
                        //Show product name as title of results panel div
                        $("#thisProduct").append(upcresponse.product_name + " (" + upc + ")");
                        //Loop through each allergen in the product
                        for (i = 0; i < 15; i++) {
                            // if(upcresponse == null){ // Checks if UPC is not in the API
                            //   $("#thisProduct").append("Sorry " + upcresponse.product_name + " (" + upc + ")" + " is not in our records!");
                            // }
                            if (upcresponse.allergens[i].allergen_value >= 1) {
                                $("#new-UPCInput-Allergen").append(
                                    "<div><strong>" + upcresponse.allergens[i].allergen_name + "</strong><br>" + "Allergen value: " + upcresponse.allergens[i].allergen_value + "<br>" + " <span class='redIngredients'>Red: " + upcresponse.allergens[i].allergen_red_ingredients + "<br>" + " <span class='yellowIngredients'>Yellow: " + upcresponse.allergens[i].allergen_yellow_ingredients + "<br><br>");
                            }
                        }

                        //Loop through each additive in the product
                        for (i = 0; i < 21; i++) {
                            if (upcresponse.additives[i].additive_value >= 1) {
                                $("#new-UPCInput-Additive").append(
                                    "<div><strong>" + upcresponse.additives[i].additive_name + "</strong><br>" + "Additive value: " + upcresponse.additives[i].additive_value + "<br>" + " <span class='redIngredients'>Red: " + upcresponse.additives[i].additive_red_ingredients + "<br>" + " <span class='yellowIngredients'>Yellow: " + upcresponse.additives[i].additive_yellow_ingredients + "<br><br>");
                            }
                        }

                        //Scroll to results panel
                        $('html, body').animate({
                            scrollTop: $("#thisProduct").offset().top
                        }, 1500);

                        relatedItems(upcresponse.product_name);
                    });
                }

                //Call related items from Walmart API
                function relatedItems(data) {
                    $.ajax({
                        url: "http://cors-anywhere.herokuapp.com/http://api.walmartlabs.com/v1/search?query=" + data + "&format=json&categoryId=976759&apiKey=2ahdxqdhzd7thd5u846wgf2m",
                        method: 'GET'
                    }).done(function(walmartResponse) {

                        console.log(walmartResponse);
                        $("#relatedItems").empty();
                        $("#relatedItems").removeClass("displayOff");
                        for (i = 0; i < 10; i++) {
                            var walmartUpcVariable = window.location.pathname + '?upc=' + walmartResponse.items[i].upc;
                            $("#relatedItems").append("<div class='imageInline'>" + "<br>" +
                                walmartResponse.items[i].name + "<br>" +
                                "<a href='" + walmartResponse.items[i].productUrl + "' target='_blank'>" + "<img class='relatedItemsFromWalmart' src=" + walmartResponse.items[i].thumbnailImage + "/>" + "</a>" +
                                "<br>" + " Price: $" + walmartResponse.items[i].salePrice + "<br>" + "UPC: " + "<a href='" + walmartUpcVariable + "'>" + walmartResponse.items[i].upc + "</a>" + "</p></div> ");
                        }
                    })
                }
            });


        //Reference(s):
        //CSS Tricks - getQueryVariable function
