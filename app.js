                                                    ///////////////////////////////////////////////////////
$(window).on("orientationchange",function(){
      alert("The orientation has changed!");
      if(window.orientation == 0) // Portrait
      {
      $("p").css({"background-color":"yellow"});
      //$("p").css({"background-color":"yellow","font-size":"300%"});
      }
      else // Landscape
      {
      $("p").css({"background-color":"pink"});
        //$("p").css({"background-color":"pink","font-size":"50%"});
      }
  });
 ///////////////////////////////////////////////////////


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
  var upc = [];
  var labelURL = ''; 
  var sid = '';
  var qtytoggles = 15;                              ///////////////////////////////////////////////////////
  var selectedToggle = [];                          ///////////////////////////////////////////////////////

  window.onload = function(){
    var sessionURL = "http://cors-anywhere.herokuapp.com/http://api.foodessentials.com/createsession?uid=demoUID_01&devid=demoDev_01&appid=demoApp_01&f=json&api_key=x49rczhgarkyz7hzpxsez2nn";
    $.ajax({
      url: sessionURL,
      method: 'GET'
    }).done(function(session) {
      
      sid = session.session_id;
      console.log("SID: " +sid);

      database.ref().push({
        sessionID: sid
      })
    })
  }

  //Step 1: add your allergen


  //Toggles button
  var toggleDiv = $("<div>");

  $(".allergen-icons-button").on("click", function(){
      $(this).toggleClass('selected');
      toggleDiv.append(selectedToggle[0]);              ///////////////////////////////////////////////////////
  })

  //Click event for searching products
  $(document).on("click", "#add-product", function() { // ---scrollTo
    searchInput = $("#productInput").val().trim();
    searchURL = "http://cors-anywhere.herokuapp.com/http://api.foodessentials.com/searchprods?q=" + searchInput + "&sid=" + sid + "&n=100&s=0&f=json&api_key=" + labelAPIkey;

    // if(upcInput == ""){
    //   alert("Invalid entry!");
    // }

    //Function that calls allergens selected

    // Code for handling the push
    database.ref().push({
      searchInput: searchInput
    });

    $("#productInput").val("");
    $.ajax({
        url: searchURL,    
        method: 'GET'
    }).done(function(response) {
      //Displays 100 items related to the searched product
      $("#new-input").empty();
      for(i = 0; i < 100; i++){
        $("#new-input").append("<tr><td>" + response.productsArray[i].product_name + "</td><td>" + response.productsArray[i].upc);
      }   
    });
  });

  // Click event when searching by UPC
  $(document).on("click", "#add-upc", function(){
    upcInput = $("#upcInput").val().trim();

    // if(upcInput == ""){
    //   alert("Invalid entry!");
    // }

    // $("#search-results").addClass("displayOff");
    upcURL = "http://cors-anywhere.herokuapp.com/http://api.foodessentials.com/label?u=" + upcInput + "&sid=" + "3bf8bb6f-99d8-42f6-a422-3a8c37a10de8" + "&appid=demoApp_01&f=json" + "&api_key=" + labelAPIkey;
    
    //Function that calls allergens selected

    database.ref().push({
      upcInput: upcInput
    });

    $("#upcInput").val("");
    $.ajax({
      url: upcURL,
      method: 'GET'
    }).done(function(upcresponse) {

      //Show results of all allergens active in the product's ingredient
    
    $(".resultPanels").removeClass("displayOff");
    $("#new-UPCInput-Allergen").empty();
    $("#new-UPCInput-Additive").empty();

    $(".thisProduct").empty();
    $(".thisProduct").append(upcresponse.product_name + " (" + upcInput + ")");
    for(i = 0; i < 15; i++){
      if (upcresponse.allergens[i].allergen_value >= 1){
        $("#new-UPCInput-Allergen").append(
        "<div><strong>" + upcresponse.allergens[i].allergen_name + "</strong><br>"  + "Allergen value: "
        + upcresponse.allergens[i].allergen_value + "<br>" + " <span class='redIngredients'>Red: " + upcresponse.allergens[i].allergen_red_ingredients  
        + "<br>" +  " <span class='yellowIngredients'>Yellow: " + upcresponse.allergens[i].allergen_yellow_ingredients + "<br><br>");
       
        //Display allergen icon
        //If allergen name is in the list, compare the tag with the allergene name, if same, remove displayOff class        
        // if (upcresponse.allergens[i].allergen_name == data-allergenName) {
        //   $("#" + upcresponse.allergens[i].allergen_name + "Icon").removeClass("displayOff");
        // }
      }
    }

    for(i = 0; i <21; i++){
      if (upcresponse.additives[i].additive_value >= 1){
        $("#new-UPCInput-Additive").append(
        "<div><strong>" + upcresponse.additives[i].additive_name + "</strong><br>"  + "Additive value: "
        + upcresponse.additives[i].additive_value + "<br>" + " <span class='redIngredients'>Red: " + upcresponse.additives[i].additive_red_ingredients  
        + "<br>" +  " <span class='yellowIngredients'>Yellow: " + upcresponse.additives[i].additive_yellow_ingredients + "<br><br>");
      }
    }

    //Scroll to results panel
    $('html, body').animate({
        scrollTop: $("#new-UPCInput-Allergen").offset().top
    }, 1500);

    relatedItems(upcresponse.product_name);
    })

  });

  //Call related items from Walmart
  function relatedItems(data){
    $.ajax({
      url: "http://cors-anywhere.herokuapp.com/http://api.walmartlabs.com/v1/search?query=" + data + "&format=json&categoryId=976759&apiKey=2ahdxqdhzd7thd5u846wgf2m",
      method: 'GET'
    }).done(function(walmartResponse) {
      
      console.log(walmartResponse);
      $("#relatedItems").empty();
      $("#relatedItems").removeClass("displayOff");
      for (i = 0; i <10; i++){
        $("#relatedItems").append("<div class='imageInline'>" + "<br>" +
         walmartResponse.items[i].name + "<br>" + 
         "<a href='" +  walmartResponse.items[i].productUrl + "' target='_blank'>" + "<img class='relatedItemsFromWalmart' src=" + walmartResponse.items[i].thumbnailImage + "/>" + "</a>" +
          "<br>" + " Price: $" + walmartResponse.items[i].salePrice + "<br>" + "UPC: " + walmartResponse.items[i].upc + "</p></div> ");
      }
    })
  }


  //Displays allegen value, red and yellow of a UPC
  // // function displayResults(x){
  //    $("#new-input").empty();
  //         for(i = 0; i < 15; i++){
  //           var x = response;
  //           if (x.allergens[i].allergen_value >= 1){
  //             $("#new-UPCinput").append(
  //             "<div class='col-md-12'>" + upcresponse.allergens[i].allergen_name + "<br>"  + "Allergen value: "
  //             + upcresponse.allergens[i].allergen_value + "<br>" + " Red: " + upcresponse.allergens[i].allergen_red_ingredients  
  //             + "<br>" +  " Yellow: " + upcresponse.allergens[i].allergen_yellow_ingredients + "<br><br>");
             
  //             //Display allergen icon
  //             //If allergen name is in the list, compare the tag with the allergene name, if same, remove displayOff class        
  //             // if (upcresponse.allergens[i].allergen_name == data-allergenName) {
  //             //   $("#" + upcresponse.allergens[i].allergen_name + "Icon").removeClass("displayOff");
  //             // }
  //           }
  //         }
  // }


