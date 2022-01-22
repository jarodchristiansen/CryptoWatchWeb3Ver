import React, { useState, useCallback, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { Table } from "react-bootstrap";
import Link from "next/link";
import fetch from "unfetch";

function PriceFeed(props) {
  const { sub } = props;
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(
    "wss://streamer.cryptocompare.com/v2?api_key=54c69a67adfc783963d3589c5a08a40a5d619b0f22b94b1c79df9acc9129c5ff"
  );
  const [messageHistory, setMessageHistory] = useState([]);

  const [price, setPrice] = useState();

  const { sendMessage, lastMessage, readyState, lastJsonMessage } =
    useWebSocket(socketUrl, {
      onOpen: () => {
        sendMessage(
          JSON.stringify({
            action: "SubAdd",
            subs: sub,
          })
        );
      },
      onMessage: (mess) => {},
      onUpdate: (e) => {},
      onClose: (e) => {
        sendMessage(
          JSON.stringify({
            action: "SubRemove",
            subs: sub,
          })
        );
      },
      //Will attempt to reconnect on all close events, such as server shutting down
      shouldReconnect: (closeEvent) => true,
      reconnectInterval: 10000,
      onError: (err) => {
        console.log("error connecting in webSocket", err);
      },
    });

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
      if (JSON.parse(lastMessage?.data)?.PRICE !== undefined) {
        setPrice(JSON.parse(lastMessage?.data)?.PRICE);
      }
    }
  }, [lastMessage, setMessageHistory]);
  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return (
    <div>
      <span>The WebSocket is currently {connectionStatus}</span>
      {price}
    </div>
  );
}

export default function LandingTable() {
  const [statsStatus, setStatsStatus] = useState("marketCap");
  const [messageHistory, setMessageHistory] = useState([]);

  const [marketCapData, setMarketCapData] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [changes, setChanges] = useState([]);

  const [subs, setSubs] = useState([]);

  let tempSubs = [];
  // let marketCapData = [];

  const fetchMarketCap = async () => {
    let data = await fetch(`/api/asset-details/compare/market-cap/`).then(
      (r) => {
        return r.json();
      }
    );
    let tempData = [];
    for (let i of data.data.Data) {
      tempSubs.push(i?.ConversionInfo?.SubsNeeded);
      // marketCapData.push(i);
      tempData.push(i);
      setMarketCapData(tempData);
    }
    if (marketCapData !== data.data.Data) {
      // setMarketCapData(data.data.Data);
      addSubs(tempSubs);
    } else {
      addSubs(tempSubs);
    }
  };

  const fetchVolumes = async () => {
    let data = await fetch(`/api/asset-details/compare/volumes/`).then((r) => {
      return r.json();
    });
    let tempData = [];
    for (let i of data.data.Data) {
      tempSubs.push(i?.ConversionInfo?.SubsNeeded);
      // marketCapData.push(i);
      tempData.push(i);
      setVolumes(tempData);
    }
    if (volumes !== data.data.Data) {
      // setMarketCapData(data.data.Data);
      addSubs(tempSubs);
    } else {
      addSubs(tempSubs);
    }
  };

  const fetchChanges = async () => {
    let data = await fetch(`/api/asset-details/compare/changes/`).then((r) => {
      return r.json();
    });
    console.log("this is the data in fetchChanges", data);
    let tempData = [];
    for (let i of data.data.Data) {
      tempSubs.push(i?.ConversionInfo?.SubsNeeded);
      // marketCapData.push(i);
      tempData.push(i);
      setChanges(tempData);
    }
    if (volumes !== data.data.Data) {
      // setMarketCapData(data.data.Data);
      addSubs(tempSubs);
    } else {
      addSubs(tempSubs);
    }
  };

  const addSubs = async (subs) => {
    console.log("this is the subs in addSubs", subs);
    setSubs(subs);
  };

  useEffect(() => {
    if (statsStatus === "marketCap") {
      fetchMarketCap();
    } else if (statsStatus === "volume") {
      fetchVolumes();
    } else if (statsStatus === "changes") {
      fetchChanges();
    }
  }, [statsStatus]);

  return (
    <div>
      <button onClick={() => setStatsStatus("marketCap")}>Market Cap</button>
      <button onClick={() => setStatsStatus("volume")}>Volume</button>
      <button onClick={() => setStatsStatus("changes")}>Changes</button>
      <h1>
        {statsStatus === "marketCap"
          ? "Top Ranked By Market Cap"
          : statsStatus === "volume"
          ? "Top Ranked By Volume 24H"
          : statsStatus === "changes"
          ? "Top By Percent Changed"
          : "N/A"}
      </h1>
      <Table striped bordered hover responsive style={{ overflow: "scroll" }}>
        <thead>
          <tr>
            <th>Logo</th>
            <th>Asset Symbol</th>
            <th>Data</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {marketCapData?.length > 2 && statsStatus === "marketCap" && (
            <>
              {marketCapData?.map((y, idx) => {
                return (
                  <tr key={y.CoinInfo.Id}>
                    <td>
                      {/*const exploreLink = `/assets/${symbol}`;*/}
                      <a href={`/assets/${y?.CoinInfo?.Name}`}>
                        <img
                          style={{ height: "60px" }}
                          src={
                            "https://www.cryptocompare.com/" +
                            y?.CoinInfo?.ImageUrl
                          }
                        />
                      </a>
                    </td>
                    <td>{y?.CoinInfo?.Name}</td>

                    <td>
                      <th>Asset Name</th>
                      <tr>{y?.CoinInfo?.FullName}</tr>
                      <th>Algorithm</th>
                      <tr>{y?.CoinInfo?.Algorithm}</tr>
                      <th>Launch Date</th>
                      <tr>{y?.CoinInfo?.AssetLaunchDate}</tr>
                      {y?.CoinInfo?.BlockReward > 0 && (
                        <>
                          <th>Block Reward</th>
                          {y?.CoinInfo?.BlockReward}
                        </>
                      )}
                      {y?.CoinInfo?.MaxSupply > 0 && (
                        <>
                          <b>Max Supply: </b>
                          {y?.CoinInfo?.MaxSupply}
                          {"  /  "}
                        </>
                      )}

                      {y?.ConversionInfo?.Supply > 0 && (
                        <>
                          <b>Current Supply: </b>
                          {y?.ConversionInfo?.Supply}
                        </>
                      )}

                      {y?.CoinInfo?.Rating && (
                        <>
                          <tr>
                            <td>
                              <th>Market Performance Rating</th>
                              {
                                y?.CoinInfo?.Rating.Weiss
                                  .MarketPerformanceRating
                              }
                            </td>
                            <td>
                              <th>Weiss Rating</th>
                              {y?.CoinInfo?.Rating.Weiss.Rating}
                            </td>
                            <td>
                              <th>Technology Adoption Rating</th>
                              {
                                y?.CoinInfo?.Rating.Weiss
                                  .TechnologyAdoptionRating
                              }
                            </td>
                            {/*<td>*/}
                            {/*  <th>Weiss Rating</th>*/}
                            {/*  {y?.CoinInfo?.Rating.Weiss.Rating}*/}
                            {/*</td>*/}
                          </tr>
                        </>
                      )}
                    </td>
                    <td>
                      {/*<PriceSocket sub={y?.ConversionInfo?.SubNeeded} />*/}
                      {y?.ConversionInfo?.SubsNeeded}
                      <PriceFeed sub={y?.ConversionInfo?.SubsNeeded} />
                    </td>
                  </tr>
                );
              })}
            </>
          )}

          {/*Volumes Table Below, This may be designated into seperate components itself at some point.*/}

          {volumes?.length > 2 && statsStatus === "volume" && (
            <>
              {volumes?.map((y, idx) => {
                return (
                  <tr key={y.CoinInfo.Id}>
                    <td>
                      <a href={`/assets/${y?.CoinInfo?.Name}`}>
                        <img
                          style={{ height: "60px" }}
                          src={
                            "https://www.cryptocompare.com/" +
                            y?.CoinInfo?.ImageUrl
                          }
                        />
                      </a>
                    </td>
                    <td>{y?.CoinInfo?.Name}</td>
                    <td>{y?.CoinInfo?.FullName}</td>
                    <td>
                      <th>Algorithm</th>
                      <tr>{y?.CoinInfo?.Algorithm}</tr>
                      <th>Launch Date</th>
                      <tr>{y?.CoinInfo?.AssetLaunchDate}</tr>
                      {y?.CoinInfo?.BlockReward > 0 && (
                        <>
                          <th>Block Reward</th>
                          {y?.CoinInfo?.BlockReward}
                        </>
                      )}
                      {y?.ConversionInfo?.TotalVolume24H && (
                        <>
                          <th>Total Volume 24H Hours</th>
                          {y?.ConversionInfo?.TotalVolume24H}
                        </>
                      )}
                      {y?.CoinInfo?.MaxSupply > 0 && (
                        <>
                          <b>Max Supply: </b>
                          {y?.CoinInfo?.MaxSupply}
                          {"  /  "}
                        </>
                      )}

                      {y?.ConversionInfo?.Supply > 0 && (
                        <>
                          <b>Current Supply: </b>
                          {y?.ConversionInfo?.Supply}
                        </>
                      )}

                      {y?.CoinInfo?.Rating && (
                        <div>
                          <tr>
                            <td>
                              <th>Market Performance Rating</th>
                              {
                                y?.CoinInfo?.Rating.Weiss
                                  .MarketPerformanceRating
                              }
                            </td>
                            <td>
                              <th>Weiss Rating</th>
                              {y?.CoinInfo?.Rating.Weiss.Rating}
                            </td>
                            {/*<td>*/}
                            {/*  <th>Weiss Rating</th>*/}
                            {/*  {y?.CoinInfo?.Rating.Weiss.Rating}*/}
                            {/*</td>*/}
                            <td>
                              <th>Technology Adoption Rating</th>
                              {
                                y?.CoinInfo?.Rating.Weiss
                                  .TechnologyAdoptionRating
                              }
                            </td>
                          </tr>
                        </div>
                      )}
                    </td>
                    <td>
                      {/*<PriceSocket sub={y?.ConversionInfo?.SubNeeded} />*/}
                      {y?.ConversionInfo?.SubsNeeded}
                      <PriceFeed sub={y?.ConversionInfo?.SubsNeeded} />
                    </td>
                  </tr>
                );
              })}
            </>
          )}

          {/*This is the changes component           */}

          {changes?.length > 2 && statsStatus === "changes" && (
            <>
              {changes?.map((y, idx) => {
                return (
                  <tr key={y.CoinInfo.Id}>
                    <td>
                      <a href={`/assets/${y?.CoinInfo?.Name}`}>
                        <img
                          style={{ height: "60px" }}
                          src={
                            "https://www.cryptocompare.com/" +
                            y?.CoinInfo?.ImageUrl
                          }
                        />
                      </a>
                    </td>
                    <td>{y?.CoinInfo?.Name}</td>
                    <td>{y?.CoinInfo?.FullName}</td>
                    <td>
                      <th>Algorithm</th>
                      <tr>{y?.CoinInfo?.Algorithm}</tr>
                      <th>Launch Date</th>
                      <tr>{y?.CoinInfo?.AssetLaunchDate}</tr>
                      {y?.CoinInfo?.BlockReward > 0 && (
                        <>
                          <th>Block Reward</th>
                          {y?.CoinInfo?.BlockReward}
                        </>
                      )}
                      {y?.ConversionInfo?.TotalVolume24H && (
                        <>
                          <th>Total Volume 24H Hours</th>
                          {y?.ConversionInfo?.TotalVolume24H}
                        </>
                      )}
                      {y?.CoinInfo?.MaxSupply > 0 && (
                        <>
                          <b>Max Supply: </b>
                          {y?.CoinInfo?.MaxSupply}
                          {"  /  "}
                        </>
                      )}

                      {y?.ConversionInfo?.Supply > 0 && (
                        <>
                          <b>Current Supply: </b>
                          {y?.ConversionInfo?.Supply}
                        </>
                      )}

                      {y?.CoinInfo?.Rating && (
                        <div>
                          <tr>
                            <td>
                              <th>Market Performance Rating</th>
                              {
                                y?.CoinInfo?.Rating.Weiss
                                  .MarketPerformanceRating
                              }
                            </td>
                            <td>
                              <th>Weiss Rating</th>
                              {y?.CoinInfo?.Rating.Weiss.Rating}
                            </td>
                            {/*<td>*/}
                            {/*  <th>Weiss Rating</th>*/}
                            {/*  {y?.CoinInfo?.Rating.Weiss.Rating}*/}
                            {/*</td>*/}
                            <td>
                              <th>Technology Adoption Rating</th>
                              {
                                y?.CoinInfo?.Rating.Weiss
                                  .TechnologyAdoptionRating
                              }
                            </td>
                          </tr>
                        </div>
                      )}
                    </td>
                    <td>
                      {/*<PriceSocket sub={y?.ConversionInfo?.SubNeeded} />*/}
                      {y?.ConversionInfo?.SubsNeeded}
                      <PriceFeed sub={y?.ConversionInfo?.SubsNeeded} />
                    </td>
                  </tr>
                );
              })}
            </>
          )}
        </tbody>
      </Table>
    </div>
  );
}
