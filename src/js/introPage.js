import swipingLayout from './swipingLayout'
import loadingSection from './loadingSection'



function init(){
    return new Promise(function (resolve, reject) {
        d3.select(".login-slide").select(".button-main").on("click",function(){
            swipingLayout.swipeNext();
            resolve();
        })
    })
}

export default { init };