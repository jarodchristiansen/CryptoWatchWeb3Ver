var cache = require("memory-cache");

export default async (req, res) => {
  let testData = cache.get(`marketCapData`);

  let data;
  if (testData) {
    data = testData;
    console.log("testDta is there, setting from cache", data);
  } else {
    data = await fetch(
      "https://min-api.cryptocompare.com/data/top/mktcap?limit=5&tsym=USD&api_key=54c69a67adfc783963d3589c5a08a40a5d619b0f22b94b1c79df9acc9129c5ff"
    ).then((response) => response.json());

    //Hits this area if the value is no longer in the cache to prevent the data from being hit too frequently. currently 12 hours as it is on a daily UI
    cache.put(`marketCapData`, data, 72000000, function (key, value) {
      console.log(key + " did " + value);
    });
  }

  res.json({ data: data });

  // if (assetCollection) {
  //   if (time) {
  //     let uniswap = await assetCollection.find({}).limit(time).toArray();
  //
  //     res.json(uniswap);
  //   }
  //   console.log("time is not defined", time);
  //   // res.json({data: assetCollection})
  // } else {
  //   res.status(400).json("no assetCollection");
  // }
};
