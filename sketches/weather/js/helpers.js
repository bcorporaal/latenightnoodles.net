let SCALE_FACTOR = 1;

function resizeSketch() {
  const { width, height, scaleFactor } = getCanvasSizeAndScale();
  resetMatrix();

  SCALE_FACTOR = scaleFactor;
  resizeCanvas(width, height);
}

function setupPrototypeSketch() {
  const { width, height, scaleFactor } = getCanvasSizeAndScale();

  SCALE_FACTOR = scaleFactor;
  createCanvas(width, height);

  window.addEventListener("resize", resizeSketch);
}

function getCanvasSizeAndScale(
  fitWidth = windowWidth,
  fitHeight = windowHeight
) {
  // A1 size
  const desiredWidth = ABRI_WIDTH;
  const desiredHeight = ABRI_HEIGHT;
  const desiredAspectRatio = desiredWidth / desiredHeight;
  const windowAspectRatio = fitWidth / fitHeight;
  const width =
    desiredAspectRatio > windowAspectRatio
      ? fitWidth
      : fitHeight * desiredAspectRatio;
  const height =
    desiredAspectRatio > windowAspectRatio
      ? fitWidth / desiredAspectRatio
      : fitHeight;
  const scaleFactor = width / desiredWidth;
  return { width, height, scaleFactor };
}

function exportPoster() {
  const dpi = 300;

  // A1 size
  const widthInch = 23.375;
  const heightInch = 33.125;

  const exportWidth = dpi * widthInch;
  const exportHeight = dpi * heightInch;

  const { width, height, scaleFactor } = getCanvasSizeAndScale(
    exportWidth,
    exportHeight
  );

  resetMatrix();

  SCALE_FACTOR = scaleFactor;
  resizeCanvas(width, height);

  saveCanvas("poster_export");

  resizeSketch();
}

function prepareData() {
  dataManager = new DataManager();
}

function getData(city, dateFrom, dateTo, resolution) {
  return dataManager.getData(city, dateFrom, dateTo, resolution);
}

function getDataPerDay(city, day, month, year, dayTo, monthTo, yearTo) {
  return dataManager.getDataPerDay(
    city,
    year,
    month,
    day,
    yearTo,
    monthTo,
    dayTo
  );
}

function getDataPerMonth(city, month, year, monthTo, yearTo) {
  return dataManager.getDataPerMonth(city, year, month, yearTo, monthTo);
}

function getDataPerYear(city, year, yearTo) {
  return dataManager.getDataPerYear(city, year, yearTo);
}
