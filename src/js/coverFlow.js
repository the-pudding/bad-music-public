import realShadow from './realShadow'

// import realShadow from 'real-shadow'

let imageWidth = 120+50;
let coverWrapper = null;
let coverImages = null;
let shadowLength = 7;
let shadowOpacity = .1;


let picturesElapsed = 0;//Math.floor(window.innerWidth/2/imageWidth);

function loadImage(url) {
    return new Promise(resolve => {
      const image = new Image();
      image.addEventListener('load', () => {
        resolve(image);
      })
      image.src = url;
    });
}

function raiseCover(indexOfCover){
    d3.select(".cover-wrapper").selectAll(".cover")
        .transition()
        .duration(500)
        .delay(1000)
        .style("padding-bottom",function(d,i){
            if(i==indexOfCover){
                return "30px"
            }
            return null;
        })
        .on("end",function(){
            realShadow.update();
        });
}

function scrollTick(tickAmount){
    let picturesElapsedBefore = picturesElapsed;

    picturesElapsed = tickAmount + picturesElapsedBefore

    coverImages.classed("cover-img-active",function(d,i){
        if( i < (picturesElapsed + Math.floor(window.innerWidth/imageWidth))  && i > (picturesElapsed - Math.floor(window.innerWidth/imageWidth)*2) ){
            return true;
        }
        return false;
    })

    coverWrapper
        .transition()
        .duration(tickAmount*1250)
        //.style("transform", `translate3d(${window.innerWidth - (picturesElapsedBefore*imageWidth + tickAmount*imageWidth)}px,0,0)`)

        //.style("left", `${window.innerWidth - (picturesElapsedBefore*imageWidth + tickAmount*imageWidth)}px`)
        .styleTween("left", function() {
            return function(t) {
                if(Math.round(t*100) % 5 == 0){
                    realShadow.update();
                }
                return `${window.innerWidth/2 - (picturesElapsedBefore*imageWidth + tickAmount*imageWidth*t - imageWidth)}px`;

                //return `translate3d(${window.innerWidth - (picturesElapsedBefore*imageWidth + tickAmount*imageWidth*t)}px,0,0)`;
                //return "hsl(" + t * 360 + ",100%,50%)";
            };
        })
        .on("end",function(d){
            realShadow.reset();
            realShadow(document.getElementsByClassName('cover-img-active'),{
                followMouse: false,   // default: true
                length: shadowLength,
                opacity:shadowOpacity,
                pageX: window.innerWidth/2,
                pageY: 0
            })
        })
        ;


}

function init(imageSet,container){

    let yScaleJitter = d3.scaleLinear().domain([0,1]).range([-1,1]);
    let xScaleJitter = d3.scaleLinear().domain([0,1]).range([11,15]);

    coverWrapper = d3.select(container)
        //.style("transform",`translate3d(${window.innerWidth - picturesElapsed*imageWidth}px,0,0)`)
        .style("left",function(){
            if(container != ".cover-score"){
                return `${window.innerWidth/2 - picturesElapsed*imageWidth + imageWidth}px`
            }
            return null;
        })
        .style("opacity",0)


    let cover = coverWrapper
        .selectAll("div")
        .data(imageSet)
        .enter()
        .append("div")
        .attr("class","cover")
        .style("width",(imageWidth-50)+"px")

    let shelf = cover.append("div")
        .attr("class","shelf")

    let shelfShadow = cover.append("div")
        .attr("class","shelf-shadow")

    coverImages = cover
        .append("div")
        .attr("class","cover-img")
        .style("height",(imageWidth-50)+"px")
        .classed("cover-img-active",function(d,i){
            if( i < Math.floor(window.innerWidth/imageWidth)*2){
                return true;
            }
            return false;
        })
        .attr("data-shadow-color","16,26,64")
        .style("transform",function(){
            return `perspective(730px) rotateX(${Math.floor(xScaleJitter(Math.random()))}deg) rotateY(${Math.floor(yScaleJitter(Math.random()))}deg)`
        })
        .each(function(d,i){
            let el = d3.select(this);
            d3.image(d, {crossOrigin: "anonymous"}).then(function(img) {
                el.append("img").attr("src",img.src).style("height",imageWidth-50+"px");
                el.append("img").attr("src",img.src).attr("class","img-fake").style("height",imageWidth-50+"px");
            });

            el.append("div").attr("class","plastic").style("transform",function(){
                return `translate(-1px,0px)`;// rotate(${90*i}deg)`
            })
        })
        ;

        realShadow(document.getElementsByClassName('cover-img-active'),{
            followMouse: false,   // default: true
            length: shadowLength,
            opacity:shadowOpacity,
            pageX: window.innerWidth/2,
            pageY: 0
        })

        coverWrapper.transition("opacity").duration(1000).style("opacity",1);

}

export default { init, scrollTick, raiseCover };
