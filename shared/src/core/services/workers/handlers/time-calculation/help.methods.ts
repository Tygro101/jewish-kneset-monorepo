export const getDayName = (day: number) => {
    switch (day) {
        case 0:
            return "יום ראשון";
        case 1:
            return "יום שני";
        case 2:
            return "יום שלישי";
        case 3:
            return "יום רביעי";
        case 4:
            return "יום חמישי";
        case 5:
            return "יום שישי";
        case 6:
            return "יום שבת קודש";

    }
}
export const excludeHagName = (hagName: string): boolean => {
    switch (hagName) {
        case "פסח":
            return false;
        default:
            return true;
    }
}



export const tzum = (month: string, day: string) => {
    switch (month) {
        case "טבת":
            if (day === "י'") {
                return true;
            }
            break;
        case "אב":
            if (day === "ט'") {
                return true;
            }
            break;
        case "תשרי":
            if (day === "י'" || day === "ג'") {
                return true;
            }

        case "תמוז":
            if (day === "יז'") {
                return true;
            }
        default:
            return false;
    }

    return false;
}


export const msToMinute = (ms: number): number => {
    return ms / 60000;
}