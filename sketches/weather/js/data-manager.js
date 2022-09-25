class DataManager {
  #cityData = {};
  #cities = [
    "amsterdam",
    "barcelona",
    "berlin",
    "copenhagen",
    "dublin",
    "london",
    "lugano",
    "montpellier",
  ];

  constructor() {
    for (const city of this.#cities) {
      const url = `data/${city}.json`;
      this.#cityData[city] = loadJSON(url);
    }
  }

  static #generateDataKeys(dateFrom, dateTo, resolution) {
    const keys = [];
    let tempDate = new Date(dateFrom.valueOf());

    while (tempDate.valueOf() <= dateTo.valueOf()) {
      const key =
        resolution === "year"
          ? tempDate.getFullYear().toString()
          : resolution === "month"
          ? `${tempDate.getFullYear()}${(tempDate.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`
          : `${tempDate.getFullYear()}${(tempDate.getMonth() + 1)
              .toString()
              .padStart(2, "0")}${tempDate
              .getDate()
              .toString()
              .padStart(2, "0")}`;
      keys.push(key);

      // We just add one resolution period using Date(), since it nicely handles
      // month/year wraparounds
      tempDate = new Date(
        resolution === "year"
          ? tempDate.setFullYear(tempDate.getFullYear() + 1)
          : resolution === "month"
          ? tempDate.setMonth(tempDate.getMonth() + 1)
          : tempDate.setDate(tempDate.getDate() + 1)
      );
    }

    return keys;
  }

  getDataPerDay(city, year, month, day, yearTo, monthTo, dayTo) {
    this.#checkCity(city);
    this.#checkNumbers(year, month, day, yearTo, monthTo, dayTo);

    if (!year || !month || !day) {
      throw new Error(
        `Oh come on. You call a function called 'getDataPerDay'. PER DAY. Then give me a day to work from! What kind of date is ${day}/${month}/${year}? Can YOU tell me?`
      );
    }

    if (day < 1 || day > 31) {
      console.warn(
        `I sure hope you know what you are doing, because a day of ${day} doesn't exist in calendars most people use. I'll fly with it though!`
      );
    }

    if (month < 1 || month > 12) {
      console.warn(
        `I sure hope you know what you are doing, because a month of ${month} doesn't exist in calendars most people use. I'll fly with it though!`
      );
    }

    if ((yearTo || monthTo || dayTo) && !(yearTo && monthTo && dayTo)) {
      throw new Error(
        `Ah, you want a full range per day? Give me a full end date then! What kind of date is ${dayTo}/${monthTo}/${yearTo}? Can YOU tell me?`
      );
    }

    // Convert everything to a date object first to make things foolproof
    const dateFrom = new Date(year, month - 1, day);
    const dateTo =
      yearTo && monthTo && dayTo
        ? new Date(yearTo, monthTo - 1, dayTo)
        : dateFrom;

    const data = this.getData(city, dateFrom, dateTo, "day");

    if (data.length === 0) {
      const startMonthKey = month.toString().padStart(2, "0");
      const startDayKey = day.toString().padStart(2, "0");
      const endMonthKey = monthTo.toString().padStart(2, "0");
      const endDayKey = dayTo.toString().padStart(2, "0");

      if (yearTo) {
        throw new Error(
          `I have looked everywhere. I'm serious. Took me a while too. Thanks for that. But there is no data for '${city}' between ${startDayKey}/${startMonthKey}/${year} and ${endDayKey}/${endMonthKey}/${yearTo}. I have the feeling you already knew though. Are you playing with me? Don't do that too often or I quit. No really, I'm DEAD SERIOUS.`
        );
      }
      throw new Error(
        `Just the data for one day. Seemed like a nice little task. But noooooooo. You give me some weird date that just doesn't exist in the dataset. You knew already didn't you? You think I like jokes like that? You better don't do that again... Or well if you do, better try something else then '${city}' on ${startDayKey}/${startMonthKey}/${year}`
      );
    }

    return data.length === 1 ? data[0] : data;
  }

  getDataPerMonth(city, year, month, yearTo, monthTo) {
    this.#checkCity(city);
    this.#checkNumbers(year, month, yearTo, monthTo);

    if (!year || !month) {
      throw new Error(
        `Oh come on. You call a function called 'getDataPerMonth'. PER MONTH. Then give me a month to work from! What kind of month is ${month}/${year}? Can YOU tell me?`
      );
    }

    if (month < 1 || month > 12) {
      console.warn(
        `I sure hope you know what you are doing, because a month of ${month} doesn't exist in calendars most people use. I'll fly with it though!`
      );
    }

    if ((yearTo || monthTo) && !(yearTo && monthTo)) {
      throw new Error(
        `Ah, you want a full range per month? Give me a proper end month of that range then! What kind of month is ${monthTo}/${yearTo}? Can YOU tell me?`
      );
    }

    // Convert everything to a date object first to make things foolproof
    const dateFrom = new Date(year, month - 1, 1);
    const dateTo =
      yearTo && monthTo ? new Date(yearTo, monthTo - 1, 1) : dateFrom;

    const data = this.getData(city, dateFrom, dateTo, "month");

    if (data.length === 0) {
      const startMonthKey = month.toString().padStart(2, "0");
      const endMonthKey = monthTo.toString().padStart(2, "0");

      if (yearTo) {
        throw new Error(
          `I have looked everywhere. I'm serious. Took me a while too. Thanks for that. But there is no data for '${city}' between ${startMonthKey}/${year} and ${endMonthKey}/${yearTo}. I have the feeling you already knew though. Are you playing with me? Don't do that too often or I quit. No really, I'm DEAD SERIOUS.`
        );
      }
      throw new Error(
        `Just the data for one month. Seemed like a nice little task. But noooooooo. You give me some weird date that just doesn't exist in the dataset. You knew already didn't you? You think I like jokes like that? You better don't do that again... Or well if you do, better try something else then '${city}' on ${startMonthKey}/${year}`
      );
    }

    return data.length === 1 ? data[0] : data;
  }

  getDataPerYear(city, year, yearTo) {
    this.#checkCity(city);
    this.#checkNumbers(year, yearTo);

    if (!year) {
      throw new Error(
        `Oh come on. You call a function called 'getDataPerYear'. PER YEAR. Then give me a year to work from! What kind of year is ${year}? Can YOU tell me?`
      );
    }

    // Convert everything to a date object first to make things foolproof
    const dateFrom = new Date(year, 0, 1);
    const dateTo = yearTo ? new Date(yearTo, 0, 1) : dateFrom;

    const data = this.getData(city, dateFrom, dateTo, "year");

    if (data.length === 0) {
      if (yearTo) {
        throw new Error(
          `I have looked everywhere. I'm serious. Took me a while too. Thanks for that. But there is no data for '${city}' between ${year} and ${yearTo}. I have the feeling you already knew though. Are you playing with me? Don't do that too often or I quit. No really, I'm DEAD SERIOUS.`
        );
      }
      throw new Error(
        `Just the data for one month. Seemed like a nice little task. But noooooooo. You give me some weird date that just doesn't exist in the dataset. You knew already didn't you? You think I like jokes like that? You better don't do that again... Or well if you do, better try something else then '${city}' in ${year}`
      );
    }

    return data.length === 1 ? data[0] : data;
  }

  getData(city, dateFrom, dateTo, resolution) {
    const keys = DataManager.#generateDataKeys(dateFrom, dateTo, resolution);

    return keys.reduce(
      (data, key) =>
        this.#cityData[city][key]
          ? [...data, { ...this.#cityData[city][key], date: key }]
          : data,
      []
    );
  }

  #checkCity(city) {
    if (!city) {
      throw new Error(
        "What do you think, that I can read minds? You want data, sure. BUT WHAT FOR? SHOULD I JUST TAKE A GUESS AT WHAT CITY YOU NEED DATA FOR? Try again, this time tell me which city please."
      );
    }

    if (typeof city !== "string") {
      throw new Error(
        `I know you like strings, but ${city} isn't one. Cities have names here, you know, written, with letters and stuff.`
      );
    }

    if (!this.#cityData[city]) {
      throw new Error(
        `You could've known '${city}' is not a city in the dataset. I expect better from you. RTFM!`
      );
    }
  }

  #checkNumbers(...numbers) {
    for (const number of numbers) {
      if (number !== undefined && typeof number !== "number") {
        throw new Error(
          `I like them numbers. Much easier to work with then all the other stuff. Not so ambiguous, almost completely language independent. Nice and easy. But what kind of number is ${number}? What do you want me to do with THAT?`
        );
      }
    }
  }
}
