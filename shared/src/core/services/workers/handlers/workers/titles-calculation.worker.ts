import { ZmaniAiom } from "../models/zmani-aiom";
import { CitiesEnum } from "../models/shared-models";
import { TitlesAiom } from "../models/titles-of-aiom";
import { addDays } from "date-fns";

onmessage = (event) => {
    console.log(event);
    const titlesObject = new TitlesAiom({date: new Date(), city: CitiesEnum.NETIVOT_NEVA_SHARON});
    postMessage(titlesObject.calculateTitles());
  };