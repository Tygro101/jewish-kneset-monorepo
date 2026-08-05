import { CitiesEnum } from "../models/shared-models";
import { TitlesAiom } from "../models/titles-of-aiom";

/**
 * Resolves the calculation arguments from the worker message data.
 * Falls back to current date / default city when the message is missing or malformed.
 */
export function resolveTitlesArgs(data: unknown): { date: Date; city: CitiesEnum } {
  const fallbackDate = new Date();
  const fallbackCity = CitiesEnum.NETIVOT_NEVA_SHARON;

  if (!data || typeof data !== 'object') {
    return { date: fallbackDate, city: fallbackCity };
  }

  const obj = data as Record<string, unknown>;

  // The date arrives as an ISO string after structured-clone serialisation.
  let date: Date;
  if (obj.date instanceof Date && !isNaN(obj.date.getTime())) {
    date = obj.date;
  } else if (typeof obj.date === 'string') {
    const parsed = new Date(obj.date);
    date = isNaN(parsed.getTime()) ? fallbackDate : parsed;
  } else {
    date = fallbackDate;
  }

  const city = typeof obj.location === 'string'
    ? (obj.location as CitiesEnum)
    : fallbackCity;

  return { date, city };
}

onmessage = (event) => {
  const { date, city } = resolveTitlesArgs(event.data?.data);
  const titlesObject = new TitlesAiom({ date, city });
  postMessage(titlesObject.calculateTitles());
};
