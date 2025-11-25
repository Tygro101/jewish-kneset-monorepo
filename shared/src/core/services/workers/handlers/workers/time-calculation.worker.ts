import { ZmaniAiom } from "../models/zmani-aiom";
import { CitiesEnum } from "../models/shared-models";

onmessage = (event: { data:{data: { date: Date, location: CitiesEnum }} }) => {
  console.log(event);
  const data = event.data.data;
  const timesObject = new ZmaniAiom({ date: data.date, city: data.location });
  postMessage(timesObject.calculateTimes());
};