import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "./app/store"
import "./index.scss"
import { ClockView } from "./app/components/clock-view/ClockView"


const BASE_LANDSCAPE = { w: 1280, h: 720 };
const BASE_PORTRAIT  = { w: 720, h: 1280 };

function isPortrait() {
  return window.innerHeight > window.innerWidth;
}

function computeScale() {
  const portrait = isPortrait();
  const base = portrait ? BASE_PORTRAIT : BASE_LANDSCAPE;

  const cssWidth = window.innerWidth;
  const cssHeight = window.innerHeight;
  const dpi = 1;// window.devicePixelRatio;

  const scaleX = cssWidth / base.w;
  const scaleY = cssHeight / base.h;
  const screenScale = Math.min(scaleX, scaleY);

  const dpiScale = 1 / Math.max(1, dpi);

  return screenScale * dpiScale;
}

function updateUIScale() {
  const scale = computeScale();
  document.documentElement.style.setProperty('--ui-scale', `${scale}`);
}

window.addEventListener("resize", updateUIScale);
updateUIScale();


ReactDOM.createRoot(document.getElementById("root")!).render(

    <Provider store={store}>
      <ClockView />
    </Provider>

)
