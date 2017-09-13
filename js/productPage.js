/**
 *   @class: ProductHome
 *   @description: this class for product page actions
 *   @author: Saorabh Kumar
 *   @date: 11th Sep 2017
 */

( function (window) {

  /**
   *   @method: ProductHome
   *   @description: A constructor method
   *   @author: Saorabh Kumar
   *   @date: 11th Sep 2017
   */
  var ProductHome = function () {}
  //Adding methods in ProductHome prototype
  ProductHome.prototype = {
    util: Dekeo.Util,
    /**
     *   @method: init
     *   @description: this method called after object creation. constructor method call this method to init event listeners and prefetch user saved data
     *   @author: Saorabh Kumar
     *   @date: 11th Sep 2017
     */
    init: function () {
        var me = this;
        me.loadFile('js/json/cart.json');
    },
    /**
     *   @method: Loadfile
     *   @description: This method will fetch the information from server and render the page
     *   @author: Saorabh Kumar
     *   @date: 11th Sep 2017
     */
    loadFile: function( url ) {
        var me = this;
        var pDetails = me.util.getProductDetails( url );
        //On success mering data for rating and updating the UI
        pDetails.done(function( productsInCart ) {
          me.buildCartPg( productsInCart );
          me.productData = productsInCart;
        })
        .fail(function() {
          console.log( "error" );
        })
        .always(function() {
          console.log( "complete" );
        });
    },
    /**
     *   @method: buildCartPg
     *   @description: This will get the data from loadFile to render the page
     *   @author: Saorabh Kumar
     *   @date: 11th Sep 2017
     */
    buildCartPg: function ( data ) {
      var me = this;
      $.get("templates/p_details.html", function( htmlFormFile ) {
          $('.pTemplate').append( htmlFormFile );
          var templateId =  $('.pTemplate').find('#websites-data')
              ,lData = data.productsInCart
              ,template = Mustache.render( $(templateId).html(), { data : lData } )
              ;
          $('.pTemplate').html( template );
          var totalP = data.productsInCart.length;
          $(".tot-p-count").html(totalP);

      });
      setTimeout(function () {
        me.processEstimatedTotal();
      }, 100)

    },
    /**
     *   @method: processEstimatedTotal
     *   @description: This will run through a loop with all input values and call the util methods to get the boxes
     *   @author: Saorabh Kumar
     *   @date: 11th Sep 2017
     */
    processEstimatedTotal : function () {
      var me = this;
      //var pDetails = me.util.getProductDetails( url );
      //read qty from inout
      //var usrQty = $(".qty-prd-1-{{p_code}}");
      $(".estimated-block").html("")
      $(".p-list").find("input").each(function (key,inputValue) {

        var productQty = $(this).val();
        var productId = inputValue.dataset.productId;
        var boxArray = me.returnBoxArrayFromProductId(productId);
        //return adjusted boxes which will be shipped along with Product Id ( as an array )
        var priceLookUpObj = me.util.getAdjustedBox( productQty, boxArray, productId);
        //console.log(priceLookUpObj);
        //now prepare for the output
        me.calculateEstimatedTotal(priceLookUpObj);

      });
      me.changeEstimatedPrice();
    },
    /**
     *   @method: returnBoxArrayFromProductId
     *   @description: This will return the product id crosponds to box size
     *   @param { product_id }
     *   @author: Saorabh Kumar
     *   @date: 11th Sep 2017
     */
    returnBoxArrayFromProductId : function ( productId ) {
      var me = this;
      var products = me.productData.productsInCart;
      //var categoryArray = data.category;
      for (var i = 0; i < products.length; i++) {
          if (products[i].p_id == productId) {
              //return(products[i].product);
              //return box array
              return products[i].p_avail_package;

          }
      }
    },
    /**
     *   @method: calculateEstimatedTotal
     *   @description: This will calculate the total and return a object to build estimated ui
     *   @param { priceLookUpObj }
     *   @author: Saorabh Kumar
     *   @date: 11th Sep 2017
     */
    calculateEstimatedTotal: function (priceLookUpObj) {
      var me = this;
      var products = me.productData.productsInCart;
      var obj = {};
      var pObj = {};
      var productId = priceLookUpObj[2].split("-")[3] || priceLookUpObj[2].split("-")[2] || priceLookUpObj[2].split("-")[1];
      var test = [];
      var tes1 = {};
      var availArrays = me.allValuesSame(priceLookUpObj[1]);
      priceLookUpObj[1].forEach(function(value){
      var lookUpValue = value;
      var total_price = 0;
        //a method which will take product id and box refined qty and returns its price

        for (var i = 0; i < products.length; i++) {
          if (products[i].p_id == productId) {
              //return(products[i].product);
              //return box array
              var innerData = products[i].p_available_package.sizeswithPrice;
              innerData.forEach(function (key,value) {

                  if( key.p_size == lookUpValue ){

                    var sV = availArrays.sameArray.indexOf(lookUpValue);
                    var dV = availArrays.diffArray.indexOf(lookUpValue);
                    var len;

                    if(sV >= 0){
                      len = availArrays.sameArray.length
                    }else if (dV >= 0){
                      len = availArrays.diffArray.length
                    }

                    obj[key.p_size] = {
                      p_price : key.p_price,
                      box_size : key.p_size,
                      p_code : products[i].p_code,
                      b_count :  len,
                      total_price :  Number ( len * key.p_price ).toFixed(2),
                      p_id :  products[i].p_id,
                      tot_count : key.p_size * len,
                      currency : products[i].c_currency
                    };
                  }
              });
          }
        }
      });
      me.buildEstimatedPriceUi(obj);
    },
    /**
     *   @method: buildEstimatedPriceUi
     *   @description: Its responsibilty to build the estimated UI
     *   @param { obj }
     *   @author: Saorabh Kumar
     *   @date: 11th Sep 2017
     */
    buildEstimatedPriceUi : function ( obj ) {
      var me = this;
      var arrayObj = [];
      arrayObj.push(obj);
      var count = me.countProperties(arrayObj[0]);
      var tVal = 0;
      var bVal = 0;
      var cVal = 0;
      var finalOpObj = {};
      var headerObj = {};
      var headerTpl = "";
      var bodyTpl = "";
      var finalTpl = "";
      //var itrateObj = arrayObj;

      // 10 VS5 $17.98
      // 2 x 5 $8.99 14 MB11 $54.8
      // 1 x 8 $24.95
      // 3 x 2 $9.95 13 CF $25.85
      // 2 x 5 $9.95 1 x 3 $5.95

      for(keys in obj) {
        tVal = tVal + Number( obj[keys].tot_count );
        bVal = bVal + Number( obj[keys].total_price ) ;
        cVal = cVal + Number( obj[keys].b_count );

        headerObj = {
          tot_count : tVal,
          total_price : bVal.toFixed(2),
          pack_code : obj[keys].p_code
        };

        finalOpObj[keys] = {
          b_c : obj[keys].currency,
          no_of_boxes : obj[keys].b_count,
          pack_size : obj[keys].box_size,
          pack_indi_price : Number(obj[keys].p_price).toFixed(2)

        }
      };
      console.log(finalOpObj);
      headerTpl += `<span class="e-total"><span class="b-qty">${headerObj.tot_count}</span> | <span class="b-code">${headerObj.pack_code}</span> | <span class="b-selected-price"> $ <em>${ headerObj.total_price }</em></span><br/><span class="b-break-ups">Box Breakups</span><br/>`
      console.log(headerTpl);
      for (key in finalOpObj){
        bodyTpl += `<span class="b-selected"> ${finalOpObj[key].no_of_boxes} x ${finalOpObj[key].pack_size} </span> |
                    <span class="b-selected-price"> $ ${finalOpObj[key].pack_indi_price}</span></span><br/>`
      }

      finalTpl = headerTpl + bodyTpl;

      $('.estimated-block').append("<div class='final-box-breakup'>"+finalTpl+"</div>");
      me.updateTotalPrice();
    },
    /**
     *   @method: countProperties
     *   @description: This will be used to check the object lenght.
     *   @param { obj }
     *   @author: Saorabh Kumar
     *   @date: 11th Sep 2017
     */
    countProperties : function (obj) {
      var count = 0;
      for (var property in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, property)) {
              count++;
          }
      }
      return count;
    },
    /**
     *   @method: allValuesSame
     *   @description: This will return same boxes and different box form the object which is return by util
     *   @param { array }
     *   @author: Saorabh Kumar
     *   @date: 11th Sep 2017
     */
    allValuesSame: function(array) {
      var sameArray = [];
      var diffArray = [];
      var obj = {}
        for(var i = 0; i < array.length; i++) {
          if(array[i] == array[0]) {
            sameArray.push(array[i]);
          } else {
            diffArray.push(array[i]);
          }
        }
      return obj = {
        sameArray : sameArray,
        diffArray : diffArray
      }
    },
    /**
     *   @method: updateTotalPrice
     *   @description: This will return the sub total amout
     *   @param {  }
     *   @author: Saorabh Kumar
     *   @date: 11th Sep 2017
     */
    updateTotalPrice: function () {
      var me = this;
      var subTotal = 0;

      $('.b-selected-price em').each(function (key,val){
        subTotal = subTotal + Number(this.innerHTML);
      });

      $(".total-oder-amount").html('$' + subTotal.toFixed(2));
    },
    /**
     *   @method: changeEstimatedPrice
     *   @description: This methods has binding to recalculate the estimated price, can be done through changing input value or clicking on checkout button
     *   @param {  }
     *   @author: Saorabh Kumar
     *   @date: 11th Sep 2017
     */
    changeEstimatedPrice:function() {
      var me = this;
      var domObj = $(".p-list .p-qty-sm");

      $('.p-list input').each(function () {
          $(this).on("input",function () {
            console.log('saorabh');
            me.processEstimatedTotal();
          })
      });
      $("#checkout-price").on("click", function () {
        me.processEstimatedTotal();
      });
    }
  }
  //creating a instance of ProductHome
  var myObj = new ProductHome();
  //calling init, booting up the applciation
  myObj.init();
})(this);
