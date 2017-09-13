/**
 *   dekeo is namespace for all dekeo attributes and property
 *   this common need to include in all html pages
 *   @author: Saorabh Kumar
 *   @date: 11th Sep 2017
 */

var Dekeo = {
    homePageUrl: 'index.html'
};

/**
 *   dekeo.Util is contain utility methods
 *   @author: Saorabh Kumar
 *   @date: 11th Sep 2017
 */
Dekeo.Util = {
    /**
     *   @method: getProductDetails
     *   @description: this method to fetch product details
     *   @author: Saorabh Kumar
     *   @date: 11th Sep 2017
     */
    getProductDetails: function( url ){
      var promise = $.getJSON( url );
      return promise;
    },
    /**
     *   @method: getAdjustedBox
     *   @description: this is util method which will return distributed boxes
     *   @param { qty, boxArray, product_id }
     *   @author: Saorabh Kumar
     *   @date: 11th Sep 2017
     */
    getAdjustedBox : function (qty, boxArray, productId) {
      var me = this;
      var productId = "productId-"+productId;
      if (qty === 0) {
          return [0, [],productId];
      }
      if (boxArray.length === 0 && qty > 0) {
          return [Infinity, [], productId ];
      }
      if (boxArray[0] > qty) {
          return me.getAdjustedBox(qty, boxArray.slice(1), productId);
      } else {
          var loseIt = me.getAdjustedBox(qty, boxArray.slice(1), productId);  // just one call of change
          var useIt = me.getAdjustedBox(qty - boxArray[0], boxArray, productId); // just one call of change
          if (loseIt[0] < 1 + useIt[0]) {
              return loseIt;
          } else {
              return [1 + useIt[0], useIt[1].concat(boxArray[0]), productId];
          }
      }
    }
}
