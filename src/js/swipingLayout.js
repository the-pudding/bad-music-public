import Swiper from 'swiper';

let swiper = null;

function swipeNext(){
    swiper.slideNext();
}


function makeSecondSwiper(container){

    return new Promise(function (resolve, reject) {
            swiper = new Swiper(container, {
                // Optional parameters
                direction: 'horizontal',
                simulateTouch: false,
                slidesPerView: 'auto',
                allowTouchMove:false,
                centeredSlides: true,
                on: {
                    sliderMove: function(){
                        console.log("moving");
                    }
                }


            })
            // let thing = await swiper;
            resolve(swiper);
            //resolve(mySwiper)
        })

}

function init(startingSlide){

    return new Promise(function (resolve, reject) {
            swiper = new Swiper('.swiper-container', {
                // Optional parameters
                direction: 'horizontal',
                simulateTouch: false,
                allowTouchMove:false,
                initialSlide:startingSlide,
                on: {
                    sliderMove: function(){
                        console.log("moving");
                    }
                }
            })
            resolve(swiper);
        })

}

export default { init, swipeNext, makeSecondSwiper };
