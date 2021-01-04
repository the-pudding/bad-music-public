import TypeIt from "typeit";


function appendAscii(textToAdd,container, postDelay){
    return new Promise(function(resolve){
        let element = d3.select(container)
            .append("pre")
            .html(textToAdd)
            ;

        console.log(textToAdd);

        setTimeout(function(d){
            resolve();
        },postDelay)

    })
}

function addLine(textToAdd,container, postDelay){
    return new Promise(function(resolve){
        let element = d3.select(container)
            .append("p")
            .text(textToAdd)
            .style("opacity",0)
            .transition()
            .duration(150)
            .delay(500)
            .style("opacity",1)
            ;

        setTimeout(function(d){
            resolve();
        },postDelay)

    })
}

function specialScore(textToType,container, postDelay){
    return new Promise(function(resolve){

        let element = d3.select(container)
            .append("p")
            .attr("class","special-score");

        let typed = new TypeIt(element.node(), {
            speed: 20,
            cursorChar: "█",
            cursorSpeed: 0,
            //lifeLike:true,
            afterComplete: async (step, instance) => {
                setTimeout(function(){
                    instance.destroy();
                    resolve();
                },500)
              }
          })
          .pause(0)
          .type("> Your spotify was pretty good.", {speed:20,delay: 1500})
          .type(" jk", {speed: 100, delay: 2000})
          .delete(-15, {speed: 150, delay:1000})
          .type("bad.", {speed:200,delay: 2000})
          .move(-4,{speed: 200, delay: 0})
          .type(" ", {speed:200, delay: 0})
          .move(-1,{speed: 20, delay: 0})
          .type(`${textToType}`, {speed: 100, delay: 500})
          .move('END',{speed: 50, delay:2000})

          .go();
    })
}


function typeOut(textToType,container, postDelay){

    return new Promise(function(resolve){
        let firstRow = false;

        if(d3.select(container).selectAll("p").size() == 0){
            firstRow = true;
        };

        let element = d3.select(container).append("p")
            .classed("first-row",function(d,i){
                if(firstRow){
                    return true
                }
                return false;
            });

        let typed = new TypeIt(element.node(), {
            speed: 20,
            cursorChar: "█",
            cursorSpeed: 0,
            //lifeLike:true,
            afterComplete: async (step, instance) => {
                setTimeout(function(){
                    instance.destroy();
                    resolve();
                },500)
              }
          })
          .pause(0)
          .type(textToType, {delay: postDelay})
          .go();
    })

}

function sleepDelay(postDelay){
    return new Promise(function(resolve){
        setTimeout(function(d){
            resolve();
        },postDelay)
    });
}

export default { typeOut, addLine, sleepDelay, appendAscii, specialScore }
