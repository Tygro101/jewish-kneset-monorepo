import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "./app/store"
import App from "./App"
import "./index.scss"
import { ContentContainer } from "./app/components/content/ContentContainer"

ReactDOM.createRoot(document.getElementById("root")!).render(

    <Provider store={store}>
      <ContentContainer />
    </Provider>

)
