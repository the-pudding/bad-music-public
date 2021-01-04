/* global d3 */
import debounce from "lodash.debounce";
import isMobile from "./utils/is-mobile";
import linkFix from "./utils/link-fix";
import getData from "./getData";
import swipingLayout from "./swipingLayout";
import footer from "./footer";
import urlParameter from './utils/url-parameter'
import loadingSection from './loadingSection'
import introPage from './introPage'
import scoreSection from './scoreSection'
import aiLoading from './aiLoading'
import getFragments from './getFragments'
import privacy from './privacy'



const $body = d3.select("body");
let previousWidth = 0;
let swiper = null;

function resize() {
  // only do resize on width changes, not height
  // (remove the conditional if you want to trigger on height change)
  const width = $body.node().offsetWidth;
  if (previousWidth !== width) {
    previousWidth = width;
    //graphic.resize();
  }
}

function setupStickyHeader() {
  const $header = $body.select("header");
  if ($header.classed("is-sticky")) {
    const $menu = $body.select(".header__menu");
    const $toggle = $body.select(".header__toggle");
    $toggle.on("click", () => {
      const visible = $menu.classed("is-visible");
      $menu.classed("is-visible", !visible);
      $toggle.classed("is-visible", !visible);
    });
  }
}

async function init() {
  // adds rel="noopener" to all target="_blank" links
  linkFix();
  // add mobile class to body tag
  $body.classed("is-mobile", isMobile.any());
  // setup resize event
  window.addEventListener("resize", debounce(resize, 150));

  let token = urlParameter.get("access_token");

  //if already have token, start on second slide
  let startingSlide = 0;
  if(token.length > 0){
    startingSlide = 2;
  }

  privacy.init();

  //initiate swiper
  swiper = await swipingLayout.init(startingSlide);

  if(token.length > 0){
    footer.init();
    d3.select(".swiper-container-2").remove();
    let dataOutput = await getData.init(token);
    let fragments = await getFragments.init();

    let loadingOutput = await loadingSection.init(dataOutput,token);
    d3.select(".swiper-container").remove();
    d3.select(".cover-wrapper").remove();
    await scoreSection.init(dataOutput,token, fragments,loadingOutput)
  }
  else {
    await introPage.init(swiper);
    await aiLoading.init();
    await swiper.slideNext();
    d3.select(".swiper-container-2").remove();
    await loadingSection.init(null,token);
  }

}

init();
