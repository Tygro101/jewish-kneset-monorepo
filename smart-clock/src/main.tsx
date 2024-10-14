import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "./app/store"
import "./index.scss"
import { ClockView } from "./app/components/clock-view/ClockView"


ReactDOM.createRoot(document.getElementById("root")!).render(

    <Provider store={store}>
      <ClockView />
    </Provider>

)
