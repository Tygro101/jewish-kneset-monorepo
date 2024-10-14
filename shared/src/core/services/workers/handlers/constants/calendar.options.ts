import { CalOptions, Location } from "@hebcal/core";

export const DefaultOptions: CalOptions = {
    location: Location.lookup('Jerusalem'),
    addHebrewDates: true,
    addHebrewDatesForEvents: true,
    candlelighting: true,
    il: true,
    locale: 'he',
    molad: true,
}