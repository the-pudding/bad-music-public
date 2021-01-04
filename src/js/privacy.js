function init(){
  d3.select(".data-privacy").on("click",function(){
    d3.select(".data-modal").classed("visible",true)
  })

  d3.select(".data-modal").select("button").on("click",function(){
    d3.select(".data-modal").classed("visible",false)
  })
}

export default { init }
