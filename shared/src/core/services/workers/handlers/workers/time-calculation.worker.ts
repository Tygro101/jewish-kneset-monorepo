import { ZmaniAiom } from "../models/zmani-aiom";
import { CitiesEnum } from "../models/shared-models";

onmessage = (event) => {
    console.log(event);
    const timesObject = new ZmaniAiom({date: new Date(), city: CitiesEnum.NETIVOT_NEVA_SHARON});
    postMessage(timesObject.calculateTimes());
  };