/**
 * Copyright 2015, 2016 Alisdair Smyth
 * Modified 2026 Kolitar J'Odan
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://apache.org
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
module.exports = function(RED) {
  "use strict";

  function validateMsg(node, msg) {
    var validMsg = true;

    if (!(typeof msg.payload === "object")) {
      node.error(RED._("blindcontroller.error.invalid-msg-payload"), msg);
      validMsg = false;
    } else {
      switch (msg.topic) {
        case "sun":
          validMsg = validateSunPositionMsg(node, msg);
          break;
        case "blindPosition":
          validMsg = validateBlindPositionMsg(node, msg);
          break;
        case "blindPositionReset":
          validMsg = validateBlindPositionResetMsg(node, msg);
          break;
        case "blind":
          validMsg = validateBlindMsg(node, msg);
          break;
        case "weather":
          validMsg = validateWeatherMsg(node, msg);
          break;
        case "mode":
          validMsg = validateModeMsg(node, msg);
          break;
        default:
          node.error(
            RED._("blindcontroller.error.unknown-msg-topic") + msg.topic,
            msg
          );
          validMsg = false;
      }
    }
    return validMsg;
  }

  function validateSunPositionMsg(node, msg) {
    var validMsg = true;
    var sunProperty = ["sunInSky", "azimuth", "altitude"];
    var i;

    for (i in sunProperty) {
      if (!sunProperty.hasOwnProperty(i)) continue;
      if (!(sunProperty[i] in msg.payload)) {
        node.error(
          RED._("blindcontroller.error.sunPosition.missing-property") +
            sunProperty[i],
          msg
        );
        validMsg = false;
      }
    }
    if (validMsg) {
      if (typeof msg.payload.sunInSky != "boolean") {
        node.error(
          RED._("blindcontroller.error.sunPosition.invalid-sunInSky") +
            typeof msg.payload.sunInSky,
          msg
        );
        validMsg = false;
      }
      if (
        typeof msg.payload.altitude != "number" ||
        msg.payload.altitude > 90
      ) {
        node.error(
          RED._("blindcontroller.error.sunPosition.invalid-altitude") +
            msg.payload.altitude,
          msg
        );
        validMsg = false;
      }
      if (
        typeof msg.payload.azimuth != "number" ||
        msg.payload.azimuth < 0 ||
        msg.payload.azimuth > 360
      ) {
        node.error(
          RED._("blindcontroller.error.sunPosition.invalid-azimuth") +
            msg.payload.azimuth,
          msg
        );
        validMsg = false;
      }
    }
    return validMsg;
  }

  function invalidPosition(position, increment) {
    return (
      position &&
      (typeof position != "number" ||
        position < 0 ||
        position > 100 ||
        position % increment != 0)
    );
  }
  function validateBlindMsg(node, msg) {
    var validMsg = true;
    var blindProperty = [
      "channel",
      "orientation",
      "top",
      "bottom",
      "depth",
      "increment"
    ];
    var modes = ["Summer", "Winter"];
    var i;

    for (i in blindProperty) {
      if (!blindProperty.hasOwnProperty(i)) continue;
      if (!(blindProperty[i] in msg.payload)) {
        node.error(
          RED._("blindcontroller.error.blind.missing-property") +
            blindProperty[i],
          msg
        );
        validMsg = false;
      }
    }
    if (validMsg) {
      if (
        typeof msg.payload.orientation != "number" ||
        msg.payload.orientation < 0 ||
        msg.payload.orientation > 360
      ) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-orientation") +
            msg.payload.orientation,
          msg
        );
        validMsg = false;
      }
      if (
        msg.payload.mode &&
        (typeof msg.payload.mode != "string" ||
          modes.indexOf(msg.payload.mode) == -1)
      ) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-mode") + msg.payload.mode,
          msg
        );
        validMsg = false;
      }
      if (
        msg.payload.noffset &&
        (typeof msg.payload.noffset != "number" ||
          msg.payload.noffset < 0 ||
          msg.payload.noffset > 90)
      ) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-noffset") +
            msg.payload.noffset,
          msg
        );
        validMsg = false;
      }
      if (
        msg.payload.poffset &&
        (typeof msg.payload.poffset != "number" ||
          msg.payload.poffset < 0 ||
          msg.payload.poffset > 90)
      ) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-poffset") +
            msg.payload.poffset,
          msg
        );
        validMsg = false;
      }
      if (typeof msg.payload.top != "number" || msg.payload.top <= 0) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-top") + msg.payload.top,
          msg
        );
        validMsg = false;
      }
      if (typeof msg.payload.bottom != "number" || msg.payload.bottom < 0) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-bottom") +
            msg.payload.bottom,
          msg
        );
        validMsg = false;
      }
      if (typeof msg.payload.depth != "number" || msg.payload.depth < 0) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-depth") +
            msg.payload.depth,
          msg
        );
        validMsg = false;
      }
	  if (
        typeof msg.payload.top == "number" &&
        typeof msg.payload.bottom == "number" &&
        msg.payload.top < msg.payload.bottom
      ) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-dimensions") +
            msg.payload.top +
            " - " +
            msg.payload.bottom,
          msg
        );
        validMsg = false;
      }
      if (
        typeof msg.payload.increment != "number" ||
        msg.payload.increment < 0 ||
        msg.payload.increment > 100 ||
        100 % msg.payload.increment != 0
      ) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-increment") +
            msg.payload.increment,
          msg
        );
        validMsg = false;
      }
      if (invalidPosition(msg.payload.maxopen, msg.payload.increment)) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-maxopen") +
            msg.payload.maxopen,
          msg
        );
        validMsg = false;
      }
      if (invalidPosition(msg.payload.maxclosed, msg.payload.increment)) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-maxclosed") +
            msg.payload.maxclosed,
          msg
        );
        validMsg = false;
      }
      if (msg.payload.maxopen > msg.payload.maxclosed) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-max-settings") +
            msg.payload.maxopen +
            " - " +
            msg.payload.maxclosed,
          msg
        );
        validMsg = false;
      }
      if (
        msg.payload.altitudethreshold &&
        (typeof msg.payload.altitudethreshold != "number" ||
          msg.payload.altitudethreshold < 0 ||
          msg.payload.altitudethreshold > 90)
      ) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-altitudethreshold") +
            msg.payload.altitudethreshold,
          msg
        );
        validMsg = false;
      }
      if (
        msg.payload.cloudsthreshold &&
        (typeof msg.payload.cloudsthreshold != "number" ||
          msg.payload.cloudsthreshold < 0 ||
          msg.payload.cloudsthreshold > 100)
      ) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-cloudsthreshold") +
            msg.payload.cloudsthreshold,
          msg
        );
        validMsg = false;
      }
      if (
        invalidPosition(
          msg.payload.cloudsthresholdposition,
          msg.payload.increment
        )
      ) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-cloudsthresholdposition") +
            msg.payload.cloudsthresholdposition,
          msg
        );
        validMsg = false;
      }
      if (
        msg.payload.uvindexthreshold &&
        (typeof msg.payload.uvindexthreshold != "number" ||
          msg.payload.uvindexthreshold < 0 ||
          msg.payload.uvindexthreshold > 20)
      ) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-uvindexthreshold") +
            msg.payload.uvindexthreshold,
          msg
        );
        validMsg = false;
      }
	    if (
        invalidPosition(
          msg.payload.uvindexthresholdposition,
          msg.payload.increment
        )
      ) {
        node.error(
          RED._(
            "blindcontroller.error.blind.invalid-uvindexthresholdposition"
          ) + msg.payload.uvindexthresholdposition,
          msg
        );
        validMsg = false;
      }
      if (
        invalidPosition(
          msg.payload.temperaturethresholdposition,
          msg.payload.increment
        )
      ) {
        node.error(
          RED._(
            "blindcontroller.error.blind.invalid-temperaturethresholdposition"
          ) + msg.payload.temperaturethresholdposition,
          msg
        );
        validMsg = false;
      }
      if (invalidPosition(msg.payload.nightposition, msg.payload.increment)) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-nightposition") +
            msg.payload.nightposition,
          msg
        );
        validMsg = false;
      }
      if (
        msg.payload.expiryperiod &&
        (typeof msg.payload.expiryperiod != "number" ||
          msg.payload.expiryposition < 0)
      ) {
        node.error(
          RED._("blindcontroller.error.blind.invalid-expiryperiod") +
            msg.payload.expiryperiod,
          msg
        );
        validMsg = false;
      }
    }
    return validMsg;
  }

  function validateBlindPositionMsg(node, msg) {
    var validMsg = true;
    var blindProperty = ["channel", "blindPosition"];
    var i;

    for (i in blindProperty) {
      if (!blindProperty.hasOwnProperty(i)) continue;
      if (!(blindProperty[i] in msg.payload)) {
        node.error(
          RED._("blindcontroller.error.blindPosition.missing-property") +
            blindProperty[i],
          msg
        );
        validMsg = false;
      }
    }
    if (validMsg) {
      if (
        msg.payload.expiryperiod &&
        (typeof msg.payload.expiryperiod != "number" ||
          msg.payload.expiryperiod < 0)
      ) {
        node.error(
          RED._("blindcontroller.error.blindPosition.invalid-expiryperiod") +
            msg.payload.expiryperiod,
          msg
        );
        validMsg = false;
      }

      if (
        msg.payload.blindPosition &&
        (typeof msg.payload.blindPosition != "number" ||
          msg.payload.blindPosition < 0 ||
          msg.payload.blindPosition > 100)
      ) {
        node.error(
          RED._("blindcontroller.error.blindPosition.invalid-blindPosition") +
            msg.payload.blindPosition,
          msg
        );
        validMsg = false;
      }
    }

    return validMsg;
  }
  function validateBlindPositionResetMsg(node, msg) {
    var validMsg = true;
    var blindProperty = ["channel", "reset"];
    var i;

    for (i in blindProperty) {
      if (!blindProperty.hasOwnProperty(i)) continue;
      if (!(blindProperty[i] in msg.payload)) {
        node.error(
          RED._("blindcontroller.error.blindPosition.missing-property") +
            blindProperty[i],
          msg
        );
        validMsg = false;
      }
    }
    if (validMsg) {
      if (msg.payload.reset && typeof msg.payload.reset != "boolean") {
        node.error(
          RED._("blindcontroller.error.blindPosition.invalid-reset") +
            msg.payload.reset,
          msg
        );
        validMsg = false;
      }
    }

    return validMsg;
  }

  function validateWeatherMsg(node, msg) {
    var validMsg = true;
    if (msg.payload.clouds < 0 || msg.payload.clouds > 100) {
      node.error(
        RED._("blindcontroller.error.weather.invalid-clouds") +
          msg.payload.clouds,
        msg
      );
      validMsg = false;
    }
    if (msg.payload.uvindex < 0 || msg.payload.uvindex > 20) {
      node.error(
        RED._("blindcontroller.error.weather.invalid-uvindex") +
          msg.payload.uvindex,
        msg
      );
      validMsg = false;
    }
    return validMsg;
  }

  function validateModeMsg(node, msg) {
    var validMsg = true;
    var modeProperty = ["mode"];
    var modes = ["Summer", "Winter"];
    var i;

    for (i in modeProperty) {
      if (!modeProperty.hasOwnProperty(i)) continue;
      if (!(modeProperty[i] in msg.payload)) {
        node.error(
          RED._("blindcontroller.error.mode.missing-property") +
            modeProperty[i],
          msg
        );
        validMsg = false;
      }
    }
    if (validMsg) {
      if (
        msg.payload.mode &&
        (typeof msg.payload.mode != "string" ||
          modes.indexOf(msg.payload.mode) == -1)
      ) {
        node.error(
          RED._("blindcontroller.error.mode.invalid-mode") + msg.payload.mode,
          msg
        );
        validMsg = false;
      }
    }
    return validMsg;
  }

  function isSunInWindow(blind, azimuth) {
    var sunInWindow = false;

    if (blind.orientation - blind.noffset < 0) {
      if (
        (360 + blind.orientation - blind.noffset <= azimuth) &
          (azimuth <= 360) ||
        (0 <= azimuth && azimuth <= blind.orientation + blind.poffset)
      ) {
        sunInWindow = true;
      }
    } else if (blind.orientation + blind.poffset > 360) {
      if (
        (0 <= azimuth) & (azimuth <= blind.orientation + blind.poffset - 360) ||
        (blind.orientation - blind.noffset <= azimuth && azimuth <= 360)
      ) {
        sunInWindow = true;
      }
    } else {
      if (
        blind.orientation - blind.noffset <= azimuth &&
        azimuth <= blind.orientation + blind.poffset
      ) {
        sunInWindow = true;
      }
    }
    return sunInWindow;
  }

  function getBlindPositionReasonDesc(blindPositionReasonCode) {
    return RED._("blindcontroller.positionReason." + blindPositionReasonCode);
  }
  function calcBlindPosition(blind, sunPosition, weather) {
    var isTemperatureAConcern =
      weather.maxtemp && blind.temperaturethreshold
        ? weather.maxtemp > blind.temperaturethreshold
        : false;
    var isOvercast =
      weather.clouds && blind.cloudsthreshold
        ? weather.clouds > blind.cloudsthreshold
        : false;
    var isHighUV =
      weather.uvindex && blind.uvindexthreshold
        ? weather.uvindex > blind.uvindexthreshold
        : false;

    if (hasBlindPositionExpired(blind.blindPositionExpiry)) {
      blind.blindPosition = blind.maxopen;
      if (sunPosition.sunInSky) {
        if (isTemperatureAConcern) {
          blind.blindPosition = blind.temperaturethresholdposition;
          blind.blindPositionReasonCode = "07";
          blind.blindPositionReasonDesc = getBlindPositionReasonDesc("07");
        } else {
          blind.sunInWindow = isSunInWindow(blind, sunPosition.azimuth);
          switch (blind.mode) {
            case "Winter":
              if (blind.sunInWindow) {
                if (isOvercast) {
                  blind.blindPosition = blind.cloudsthresholdposition;
                  blind.blindPositionReasonCode = "06";
                  blind.blindPositionReasonDesc = getBlindPositionReasonDesc(
                    "06"
                  );
                } else if (isHighUV) {
                  blind.blindPosition = blind.uvindexthresholdposition;
                  blind.blindPositionReasonCode = "08";
                  blind.blindPositionReasonDesc = getBlindPositionReasonDesc(
                    "08"
                  );
                } else {
                  blind.blindPosition = blind.maxopen;
                  blind.blindPositionReasonCode = "05";
                  blind.blindPositionReasonDesc = getBlindPositionReasonDesc(
                    "05"
                  );
                }
              } else {
                blind.blindPosition = blind.maxclosed;
                blind.blindPositionReasonCode = "04";
                blind.blindPositionReasonDesc = getBlindPositionReasonDesc(
                  "04"
                );
              }
              break;
            default:
              if (blind.sunInWindow) {
                if (
                  ((blind.altitudethreshold &&
                    sunPosition.altitude >= blind.altitudethreshold) ||
                    !blind.altitudethreshold) &&
                  !isOvercast &&
                  !isHighUV
                ) {
                  var height =
                    Math.tan((sunPosition.altitude * Math.PI) / 180) *
                    blind.depth;
                  if (height <= blind.bottom) {
                    blind.blindPosition = blind.maxclosed;
                  } else if (height >= blind.top) {
                    blind.blindPosition = blind.maxopen;
                  } else {
                    blind.blindPosition = Math.ceil(
                      100 *
                        (1 -
                          (height - blind.bottom) / (blind.top - blind.bottom))
                    );
                    blind.blindPosition =
                      Math.ceil(blind.blindPosition / blind.increment) *
                      blind.increment;
                    blind.blindPosition =
                      blind.blindPosition > blind.maxclosed
                        ? blind.maxclosed
                        : blind.blindPosition;
                    blind.blindPosition =
                      blind.blindPosition < blind.maxopen
                        ? blind.maxopen
                        : blind.blindPosition;
                  }
                  blind.blindPositionReasonCode = "05";
                  blind.blindPositionReasonDesc = getBlindPositionReasonDesc(
                    "05"
                  );
                } else if (
                  blind.altitudethreshold &&
                  sunPosition.altitude < blind.altitudethreshold
                ) {
                  blind.blindPositionReasonCode = "03";
                  blind.blindPositionReasonDesc = getBlindPositionReasonDesc(
                    "03"
                  );
                } else if (isOvercast) {
                  blind.blindPosition = blind.cloudsthresholdposition;
                  blind.blindPositionReasonCode = "06";
                  blind.blindPositionReasonDesc = getBlindPositionReasonDesc(
                    "06"
                  );
                } else if (isHighUV) {
                  blind.blindPosition = blind.uvindexthresholdposition;
                  blind.blindPositionReasonCode = "08";
                  blind.blindPositionReasonDesc = getBlindPositionReasonDesc(
                    "08"
                  );
                }
              } else {
                blind.blindPositionReasonCode = "04";
                blind.blindPositionReasonDesc = getBlindPositionReasonDesc(
                  "04"
                );
              }
              if (weather) {
                blind.weather = weather;
              }
              break;
          }
        }
      } else {
        blind.blindPosition = blind.nightposition;
        blind.blindPositionReasonCode = "02";
        blind.blindPositionReasonDesc = getBlindPositionReasonDesc("02");
        blind.sunInWindow = false;
      }
      if (blind.blindPositionExpiry) {
        delete blind.blindPositionExpiry;
      }
    }
  }
    function hasBlindPositionExpired(expiryTimestampString) {
    var now = new Date();
    if (expiryTimestampString) {
      var expiry = new Date(expiryTimestampString);
      return now > expiry;
    } else {
      return true;
    }
  }

  function runCalc(node, msg, blinds, sunPosition, weather) {
    var i;
    for (i in blinds) {
      if (!blinds.hasOwnProperty(i)) continue;
      var previousBlindPosition = blinds[i].blindPosition;
      var previousSunInWindow = blinds[i].sunInWindow;
      var previousBlindPositionReasonCode = blinds[i].blindPositionReasonCode;

      calcBlindPosition(blinds[i], sunPosition, weather);

      blinds[i].logicalBlindPosition = blinds[i].blindPosition;
      blinds[i].blindPosition = blinds[i].opposite
        ? 100 - blinds[i].blindPosition
        : blinds[i].blindPosition;

      if (
        blinds[i].blindPosition != previousBlindPosition ||
        blinds[i].sunInWindow != previousSunInWindow ||
        blinds[i].blindPositionReasonCode != previousBlindPositionReasonCode
      ) {
        msg.payload = blinds[i];
        msg.data = {
          channel: blinds[i].channel,
          altitude: sunPosition.altitude,
          azimuth: sunPosition.azimuth,
          blindPosition: blinds[i].blindPosition
        };
        msg.topic = "blind";
        node.send(msg);
      }
    }
  }

  function setPosition(node, msg, blind) {
    blind.blindPosition = blind.opposite
      ? 100 - msg.payload.blindPosition
      : msg.payload.blindPosition;
    blind.logicalBlindPosition = msg.payload.blindPosition;
    blind.blindPositionExpiry = calcBlindPositionExpiry(
      msg.payload.expiryperiod ? msg.payload.expiryperiod : blind.expiryperiod
    );
    blind.blindPositionReasonCode = "01";
    blind.blindPositionReasonDesc = getBlindPositionReasonDesc("01");
    msg.payload = blind;
    msg.topic = "blind";
    node.send(msg);
  }

  function resetPosition(blind) {
    delete blind.blindPositionExpiry;
  }

  function calcBlindPositionExpiry(expiryperiod) {
    var expiryTimestamp = new Date();
    expiryTimestamp.setMinutes(expiryTimestamp.getMinutes() + expiryperiod);
    return expiryTimestamp;
  }

  function defaultIfUndefined(val, defaultVal) {
    return typeof val == "undefined" || val == "" ? defaultVal : val;
  }

  function convertToBoolean(val) {
    switch (typeof val) {
      case "boolean":
        return val;
      case "string":
        switch (val.toLowerCase().trim()) {
          case "true":
          case "yes":
          case "1":
            return true;
          case "false":
          case "no":
          case "0":
          case null:
            return false;
          default:
            return Boolean(val);
        }
    }
  }

  function BlindControllerWithoutConfig(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    var node = this;
    var blinds = [];
    var weather = {};
    var sunPosition = {};

    this.on("input", function(msg) {
      var validMsg = validateMsg(node, msg);

      if (validMsg) {
        var savedMode = node.context().get("mode");
        switch (msg.topic) {
          case "sun":
            sunPosition = msg.payload;
            runCalc(node, msg, blinds, sunPosition, weather);
            break;
          case "blindPosition":
            setPosition(node, msg, blinds[msg.payload.channel]);
            break;
          case "blindPositionReset":
            resetPosition(blinds[msg.payload.channel]);
            runCalc(node, msg, blinds, sunPosition, weather);
            break;
          case "blind":
            var channel = msg.payload.channel;
            blinds[channel] = msg.payload;
            blinds[channel].mode = defaultIfUndefined(
              msg.payload.mode,
              savedMode || RED._("blindcontroller.placeholder.mode")
            );
            blinds[channel].noffset = defaultIfUndefined(
              msg.payload.noffset,
              Number(RED._("blindcontroller.placeholder.noffset"))
            );
            blinds[channel].poffset = defaultIfUndefined(
              msg.payload.poffset,
              Number(RED._("blindcontroller.placeholder.poffset"))
            );
            blinds[channel].maxopen = defaultIfUndefined(
              msg.payload.maxopen,
              Number(RED._("blindcontroller.placeholder.maxopen"))
            );
            blinds[channel].maxclosed = defaultIfUndefined(
              msg.payload.maxclosed,
              Number(RED._("blindcontroller.placeholder.maxclosed"))
            );
            blinds[channel].nightposition = defaultIfUndefined(
              msg.payload.nightposition,
              Number(RED._("blindcontroller.placeholder.nightposition"))
            );
            blinds[channel].temperaturethresholdposition = defaultIfUndefined(
              msg.payload.temperaturethresholdposition,
              Number(
                RED._(
                  "blindcontroller.placeholder.temperaturethresholdposition"
                )
              )
            );
            blinds[channel].cloudsthresholdposition = defaultIfUndefined(
              msg.payload.cloudsthresholdposition,
              Number(
                RED._("blindcontroller.placeholder.cloudsthresholdposition")
              )
            );
            blinds[channel].uvindexthresholdposition = defaultIfUndefined(
              msg.payload.uvindexthresholdposition,
              RED._("blindcontroller.placeholder.uvindexthresholdposition")
            );
            blinds[channel].expiryperiod = defaultIfUndefined(
              msg.payload.expiryperiod,
              Number(RED._("blindcontroller.placeholder.expiryperiod"))
            );
            blinds[channel].opposite = convertToBoolean(
              defaultIfUndefined(
                msg.payload.opposite,
                RED._("blindcontroller.placeholder.opposite")
              )
            );
            break;
          case "weather":
            weather = msg.payload;
            runCalc(node, msg, blinds, sunPosition, weather);
            break;
          case "mode":
            var mode = msg.payload.mode;
            node.context().set("mode", mode);
            savedMode = mode;
            var i;
            for (i in blinds) {
              if (!blinds.hasOwnProperty(i)) continue;
              blinds[i].mode = mode;
            }
            runCalc(node, msg, blinds, sunPosition, weather);
            break;
          default:
            break;
        }

        var keys = Object.keys(blinds);
        if (keys.length > 0) {
          var activeMode = savedMode || blinds[keys].mode;
          var posSummary =
            keys.length === 1
              ? blinds[keys].blindPosition + "%"
              : keys
                  .map(function(k) {
                    return "Ch" + k + ":" + blinds[k].blindPosition + "%";
                  })
                  .join(" ");
          node.status({
            fill: sunPosition.sunInSky ? "yellow" : "blue",
            shape: "dot",
            text: activeMode + " • " + posSummary
          });
        }
      }
    });
  }
  function BlindControllerWithConfig(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    var channel = config.channel;
    var savedMode = this.context().get("mode");
    var blinds = [];
    blinds[channel] = {
      channel: channel,
      mode: savedMode || config.mode,
      orientation: Number(config.orientation),
      noffset: Number(
        defaultIfUndefined(
          config.noffset,
          RED._("blindcontroller.placeholder.noffset")
        )
      ),
      poffset: Number(
        defaultIfUndefined(
          config.poffset,
          RED._("blindcontroller.placeholder.poffset")
        )
      ),
      top: Number(config.top),
      bottom: Number(config.bottom),
      depth: Number(config.depth),
      altitudethreshold: Number(config.altitudethreshold),
      increment: Number(config.increment),
      maxopen: Number(
        defaultIfUndefined(
          config.maxopen,
          RED._("blindcontroller.placeholder.maxopen")
        )
      ),
      maxclosed: Number(
        defaultIfUndefined(
          config.maxclosed,
          RED._("blindcontroller.placeholder.maxclosed")
        )
      ),
      temperaturethreshold: config.temperaturethreshold,
      temperaturethresholdposition: Number(
        defaultIfUndefined(
          config.temperaturethresholdposition,
          RED._("blindcontroller.placeholder.temperaturethresholdposition")
        )
      ),
      cloudsthreshold: config.cloudsthreshold,
      cloudsthresholdposition: Number(
        defaultIfUndefined(
          config.cloudsthresholdposition,
          RED._("blindcontroller.placeholder.cloudsthresholdposition")
        )
      ),
      uvindexthreshold: config.uvindexthreshold,
      uvindexthresholdposition: Number(
        defaultIfUndefined(
          config.uvindexthresholdposition,
          RED._("blindcontroller.placeholder.uvindexthresholdposition")
        )
      ),
      nightposition: Number(
        defaultIfUndefined(
          config.nightposition,
          RED._("blindcontroller.placeholder.nightposition")
        )
      ),
      expiryperiod: Number(
        defaultIfUndefined(
          config.expiryperiod,
          RED._("blindcontroller.placeholder.expiryperiod")
        )
      ),
      opposite: convertToBoolean(
        defaultIfUndefined(
          config.opposite,
          RED._("blindcontroller.placeholder.opposite")
        )
      )
    };
    this.blind = blinds[channel];
    var node = this;
    var sunPosition = {};
    var weather = {};

    this.on("input", function(msg) {
      if (msg.topic == "blindPosition" || msg.topic == "blindPositionReset") {
        msg.payload.channel = defaultIfUndefined(msg.payload.channel, channel);
      }

      var validMsg = validateMsg(node, msg);

      if (validMsg) {
        switch (msg.topic) {
          case "sun":
            sunPosition = msg.payload;
            runCalc(node, msg, blinds, sunPosition, weather);
            break;
          case "blindPosition":
            setPosition(node, msg, blinds[msg.payload.channel]);
            break;
          case "blindPositionReset":
            resetPosition(blinds[msg.payload.channel]);
            runCalc(node, msg, blinds, sunPosition, weather);
            break;
          case "weather":
            weather = msg.payload;
            runCalc(node, msg, blinds, sunPosition, weather);
            break;
          case "mode":
            var mode = msg.payload.mode;
            node.context().set("mode", mode);
            var i;
            for (i in blinds) {
              if (!blinds.hasOwnProperty(i)) continue;
              blinds[i].mode = mode;
            }
            runCalc(node, msg, blinds, sunPosition, weather);
            break;
          default:
            break;
        }

        node.status({
          fill:
            blinds[channel].blindPositionReasonCode == "01"
              ? "red"
              : sunPosition.sunInSky
              ? "yellow"
              : "blue",
          shape: blinds[channel].blindPosition == 100 ? "dot" : "ring",
          text: blinds[channel].mode + " • " + blinds[channel].blindPosition + "%"
        });
      }
    });
  }

  RED.nodes.registerType("multiblindcontroller", BlindControllerWithoutConfig);
  RED.nodes.registerType("blindcontroller", BlindControllerWithConfig);
};