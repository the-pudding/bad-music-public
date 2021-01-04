
import typeOutText from './typeOutText'
import swipingLayout from './swipingLayout'

let progressBar = null;

function addProgressBar(container,elClass,textToAdd){

    progressBar = d3.select(container)
    .append("p")
    .attr("class",elClass)
    .html(textToAdd)
    .style("opacity",0)
    .transition()
    .duration(150)
    .delay(500)
    .style("opacity",1)
    ;
}

async function init(){

    function fadeIn(slide){
        d3.select(".swiper-container-2").selectAll(".swiper-slide").filter(function(d,i){
            return i == slide
        })
        .transition()
        .duration(500)
        .style("opacity",function(d,i){
            return 1;
        })

    }

    let swiperTwo = await swipingLayout.makeSecondSwiper(".swiper-container-2");

    let textLegibleDelay = 2000;


    await typeOutText.addLine("> Initializing neural net...",".ai-building-slide-title",1000);
    addProgressBar(".ai-building-slide-title","progress-bar","<span class='line-wrapper'> > Training on <span class='num'>0</span> indicators of objectively good music...</span><span class='bar'>░░░░░░░░░░</span>");

    let num = d3.select(".progress-bar").select(".num");
    let percent = d3.select(".progress-bar").select(".bar");

    fadeIn(swiperTwo.activeIndex)
    await typeOutText.sleepDelay(1000);

    let percentBarDelay = 500;
    num.text("153");
    percent.html("▓░░░░░░░░░")
    await typeOutText.sleepDelay(percentBarDelay);
    swiperTwo.slideNext();
    fadeIn(swiperTwo.activeIndex)
    num.text("500");
    percent.html("▓▓░░░░░░░░")
    await typeOutText.sleepDelay(percentBarDelay);
    swiperTwo.slideNext();
    fadeIn(swiperTwo.activeIndex)
    num.text("1,230");
    percent.html("▓▓▓░░░░░░░")
    await typeOutText.sleepDelay(percentBarDelay);
    swiperTwo.slideNext();
    fadeIn(swiperTwo.activeIndex)
    num.text("7,230");
    percent.html("▓▓▓▓░░░░░░")
    await typeOutText.sleepDelay(percentBarDelay);
    swiperTwo.slideNext();
    fadeIn(swiperTwo.activeIndex)
    num.text("18,832");
    percent.html("▓▓▓▓▓▓░░░░")
    await typeOutText.sleepDelay(percentBarDelay);
    swiperTwo.slideNext();
    fadeIn(swiperTwo.activeIndex)
    num.text("42,381");
    percent.html("▓▓▓▓▓▓▓▓░░")
    await typeOutText.sleepDelay(percentBarDelay);
    swiperTwo.slideNext();
    fadeIn(swiperTwo.activeIndex)
    num.text("79,032");
    percent.html("▓▓▓▓▓▓▓▓▓▓")

    await typeOutText.sleepDelay(1000);

    // await typeOutText.addLine("> Calibrating taste level...",".ai-building-slide-title",textLegibleDelay);
    // await typeOutText.addLine("> Analyzing vinyl collections...",".ai-building-slide-title",textLegibleDelay);
    // await typeOutText.addLine("> Loading live performances you could only see in an abandoned water tower...",".ai-building-slide-title",textLegibleDelay);
    // await typeOutText.addLine("> Seriously it was amazing...",".ai-building-slide-title",textLegibleDelay);
    // await typeOutText.addLine("> Jennica got us an invite...",".ai-building-slide-title",textLegibleDelay);
    // await typeOutText.addLine("> They had an indigenous Peruvian mixologist...",".ai-building-slide-title",textLegibleDelay);
    await typeOutText.addLine("> Finalizing...",".ai-building-slide-title",2000);

    return "hi"


}

export default { init };
