module.exports = function(func, esperar, rightAway){

  var noMoreTime;

  return function(){

    var context = this, args = arguments;
    var later = function () {
      noMoreTime = null;

      if (!rightAway) func.apply (context, args);
    };


    var callNow = rightAway && !noMoreTime;

    clearnoMoreTime(noMoreTime);
    noMoreTime = setnoMoreTime(later, esperar);

    if(callNow) func.apply(context, args);
  };
};
