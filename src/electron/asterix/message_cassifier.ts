import { parseCartesianCoordinate } from "./cat10_msg_parser";

export function sliceMainBuffer(buffer: Buffer) {
  let start = 0;
  let end = 0;

  let messages = [];
  while (end < buffer.length) {
    const len = buffer.slice(start + 1, start + 3).readInt16BE();
    end = start + len;
    // console.log(len);
    messages.push(buffer.slice(start, end));
    start = end;
  }
  // console.log({ All: messages.length });

  let cat10msg: Buffer[] = [];
  let cat21msg: Buffer[] = [];

  cat10msg = messages.filter((v) => {
    // console.log(v[0]);
    if (v[0] === 10) {
      return true;
    }
    cat21msg.push(v);
    return false;
  });

  // console.log({ cat_10: cat10msg.length });
  // console.log({ cat_21: cat21msg.length });
  let a = 0;
  cat10msg.forEach((msg) => {
    if (a <= 4) {
      console.log("MESSAGE");
      const fspec = BigInt("0x" + msg.slice(3, 7).toString("hex"))
        .toString(2)
        .padStart(4 * 8, "0")
        .split("");

      let count = 7;
      let found = false;
      let offset =
        fspec.filter((value, index) => {
          if (index == count && !found) {
            if (value != "1") {
              found = true;
            } else {
              count += 8;
            }
            return true;
          }
          return;
        }).length + 3;
      console.log("length fspec " + offset);

      if (fspec[0] === "1") {
        console.log("I010/010 Data Source Identifier");
        console.log("	" + msg.slice(offset, offset + 2).toString("hex"));
        offset += 2;
        //length =2
      }
      if (fspec[1] === "1") {
        console.log("I010/000 Message Type");
        console.log("	" + msg.slice(offset, offset + 1).toString("hex"));
        offset += 1;
        //length =1
      }
      if (fspec[2] === "1") {
        console.log("I010/020 Target Report Descriptor");
        /// First Part + First Extent + Second Extent => max 3
        let len = variableItemOffset(msg.slice(offset, offset + 3), 3);
        console.log("	" + msg.slice(offset, offset + len).toString("hex"));
        offset += len;
        //length =1+
      }
      if (fspec[3] === "1") {
        console.log("I010/140 Time of Day");
        console.log("	" + msg.slice(offset, offset + 3).toString("hex"));
        offset += 3;
        //length =3
      }
      if (fspec[4] === "1") {
        console.log("I010/041 Position in WGS-84 Co-ordinates");
        console.log("	" + msg.slice(offset, offset + 8).toString("hex"));
        offset += 8;
        //length =8
      }
      if (fspec[5] === "1") {
        console.log("I010/040 Measured Position in Polar Co-ordinates");
        console.log("	" + msg.slice(offset, offset + 4).toString("hex"));
        offset += 4;
        //length =4
      }
      if (fspec[6] === "1") {
        console.log("I010/042 Position in Cartesian Co-ordinates");
        console.log("	" + msg.slice(offset, offset + 4).toString("hex"));
        parseCartesianCoordinate(msg.slice(offset, offset + 4));
        offset += 4;
        //length =4
      }
      if (fspec[7] === "1") {
        console.log("Field Extension Indicator");

        if (fspec[8] === "1") {
          console.log("I010/200 Calculated Track Velocity in Polar Co-ordinates");
          console.log("	" + msg.slice(offset, offset + 4).toString("hex"));
          offset += 4;
          //length =4
        }
        if (fspec[9] === "1") {
          console.log("I010/202 Calculated Track Velocity in Cartesian Coord.");
          console.log("	" + msg.slice(offset, offset + 4).toString("hex"));
          offset += 4;
          //length =4
        }
        if (fspec[10] === "1") {
          console.log("I010/161 Track Number");
          console.log("	" + msg.slice(offset, offset + 2).toString("hex"));
          offset += 2;
          //length =2
        }
        if (fspec[11] === "1") {
          console.log("I010/170 Track Status");
          /// First Part + First Extent + Second Extent => max 3
          let len = variableItemOffset(msg.slice(offset, offset + 3), 3);
          console.log("	" + msg.slice(offset, offset + len).toString("hex"));
          offset += len;
          //length =1+
        }
        if (fspec[12] === "1") {
          console.log("I010/060 Mode-3/A Code in Octal Representation");
          console.log("	" + msg.slice(offset, offset + 2).toString("hex"));
          offset += 2;
          //length =2
        }
        if (fspec[13] === "1") {
          console.log("I010/220 Target Address");
          console.log("	" + msg.slice(offset, offset + 3).toString("hex"));
          offset += 3;
          //length =3
        }
        if (fspec[14] === "1") {
          console.log("I010/245 Target Identification");
          console.log("	" + msg.slice(offset, offset + 7).toString("hex"));
          offset += 7;
          //length =7
        }
        if (fspec[15] === "1") {
          console.log("Field Extension Indicator");
          if (fspec[16] === "1") {
            console.log("I010/250 Mode S MB Data");
            const len = buffer.slice(offset, offset + 1).readInt16BE();
            console.log("	" + msg.slice(offset + 1, offset + 1 + 8 * len).toString("hex"));
            offset += 1 + 8 * len;
            //length =1+8n
          }
          if (fspec[17] === "1") {
            console.log("I010/300 Vehicle Fleet Identification");
            console.log("	" + msg.slice(offset, offset + 1).toString("hex"));
            offset += 1;
            //length =1
          }
          if (fspec[18] === "1") {
            console.log("I010/090 Flight Level in Binary Representation");
            console.log("	" + msg.slice(offset, offset + 2).toString("hex"));
            offset += 2;
            //length =2
          }
          if (fspec[19] === "1") {
            console.log("I010/091 Measured Height");
            console.log("	" + msg.slice(offset, offset + 2).toString("hex"));
            offset += 2;
            //length =2
          }
          if (fspec[20] === "1") {
            console.log("I010/270 Target Size & Orientation");
            /// First Part + First Extent + Second Extent => max 3
            let len = variableItemOffset(msg.slice(offset, offset + 3), 3);
            console.log("	" + msg.slice(offset, offset + len).toString("hex"));
            offset += len;
            //length =1+
          }
          if (fspec[21] === "1") {
            console.log("I010/550 System Status");
            console.log("	" + msg.slice(offset, offset + 1).toString("hex"));
            offset += 1;
            //length =1
          }
          if (fspec[22] === "1") {
            console.log("I010/310 Pre-programmed Message");
            console.log("	" + msg.slice(offset, offset + 1).toString("hex"));
            offset += 1;
            //length =1
          }
          if (fspec[23] === "1") {
            console.log("Field Extension Indicator");

            if (fspec[24] === "1") {
              console.log("I010/500 Standard Deviation of Position");
              console.log("	" + msg.slice(offset, offset + 4).toString("hex"));
              offset += 4;
              //length =4
            }
            if (fspec[25] === "1") {
              console.log("I010/280 Presence");
              const len = buffer.slice(offset, offset + 1).readInt16BE();
              console.log("	" + msg.slice(offset + 1, offset + 1 + 2 * len).toString("hex"));
              offset += 1 + 2 * len;
              //length =1+2n
            }
            if (fspec[26] === "1") {
              console.log("I010/131 Amplitude of Primary Plot");
              console.log("	" + msg.slice(offset, offset + 1).toString("hex"));
              offset += 1;
              //length =1
            }
            if (fspec[27] === "1") {
              console.log("I010/210 Calculated Acceleration");
              console.log("	" + msg.slice(offset, offset + 2).toString("hex"));
              offset += 2;
              //length =2
            }
            if (fspec[28] === "1") {
              console.log("Spare");
              //length = Nan
            }
            if (fspec[29] === "1") {
              console.log("SP Special Purpose Field");
              //length =1+
            }
            if (fspec[30] === "1") {
              console.log("RE Reserved Expansion Field");
              //length =1+
            }
            if (fspec[31] === "1") {
              console.log("Field Extension Indicator, but no more in the spec");
            }
          }
        }
      }
    }
    a++;
  });
  a = 0;
  cat21msg.forEach((msg) => {
    if (a === 0) {
      const fspec = BigInt("0x" + msg.slice(3, 10).toString("hex"))
        .toString(2)
        .padStart(7 * 8, "0")
        .split("");

      let count = 7;
      let found = false;
      let offset =
        fspec.filter((value, index) => {
          if (index == count && !found) {
            if (value != "1") {
              found = true;
            } else {
              count += 8;
            }
            return true;
          }
          return;
        }).length + 3;
      console.log("length fspec " + offset);

      if (fspec[0] === "1") {
        console.log("I021/010 Data Source Identifier");
        console.log("	" + msg.slice(offset, 2));
        offset += 2;
        //length =2
      }
      if (fspec[1] === "1") {
        console.log("I021/040 Target Report Descriptor");
        //length =1+
      }
      if (fspec[2] === "1") {
        console.log("I021/161 Track Number");
        //length =2
      }
      if (fspec[3] === "1") {
        console.log("I021/015 Service Identification");
        //length =1
      }
      if (fspec[4] === "1") {
        console.log("I021/071 Time of Applicability for Position");
        //length =3
      }
      if (fspec[5] === "1") {
        console.log("I021/130 Position in WGS-84 co-ordinates");
        //length =6
      }
      if (fspec[6] === "1") {
        console.log("I021/131 Position in WGS-84 co-ordinates, high res.");
        //length =8
      }
      if (fspec[7] === "1") {
        console.log("Field Extension Indicator");

        if (fspec[8] === "1") {
          console.log("I021/072 Time of Applicability for Velocity");
          //length =3
        }
        if (fspec[9] === "1") {
          console.log("I021/150 Air Speed");
          //length =2
        }
        if (fspec[10] === "1") {
          console.log("I021/151 True Air Speed");
          //length =2
        }
        if (fspec[11] === "1") {
          console.log("I021/080 Target Address");
          //length =2
        }
        if (fspec[12] === "1") {
          console.log("I021/073 Time of Message Reception of Position");
          //length =3
        }
        if (fspec[13] === "1") {
          console.log("I021/074 Time of Message Reception of Position-High");
          //length =3
        }
        if (fspec[14] === "1") {
          console.log("I021/075 Time of Message Reception of Velocity");
          //length =4
        }
        if (fspec[15] === "1") {
          console.log("Field Extension Indicator");

          if (fspec[16] === "1") {
            console.log("I021/076 Time of Message Reception of Velocity-High Precision");
            //length =4
          }
          if (fspec[17] === "1") {
            console.log("I021/140 Geometric Height");
            //length =2
          }
          if (fspec[18] === "1") {
            console.log("I021/090 Quality Indicators");
            //length =1+
          }
          if (fspec[19] === "1") {
            console.log("I021/210 MOPS Version");
            //length =1
          }
          if (fspec[20] === "1") {
            console.log("I021/070 Mode 3/A Code");
            //length =2
          }
          if (fspec[21] === "1") {
            console.log("I021/230 Roll Angle");
            //length =2
          }
          if (fspec[22] === "1") {
            console.log("I021/145 Flight Level");
            //length =2
          }
          if (fspec[23] === "1") {
            console.log("Field Extension Indicator");

            if (fspec[24] === "1") {
              console.log("I021/152 Magnetic Heading");
              //length =2
            }
            if (fspec[25] === "1") {
              console.log("I021/200 Target Status");
              //length =1
            }
            if (fspec[26] === "1") {
              console.log("I021/155 Barometric Vertical Rate");
              //length =2
            }
            if (fspec[27] === "1") {
              console.log("I021/157 Geometric Vertical Rate");
              //length =2
            }
            if (fspec[28] === "1") {
              console.log("I021/160 Airborne Ground Vector");
              //length =4
            }
            if (fspec[29] === "1") {
              console.log("I021/165 Track Angle Rate");
              //length =2
            }
            if (fspec[30] === "1") {
              console.log("I021/077 Time of Report Transmission");
              //length =3
            }
            if (fspec[31] === "1") {
              console.log("Field Extension Indicator");

              if (fspec[32] === "1") {
                console.log("I021/170 Target Identification");
                //length =6
              }
              if (fspec[33] === "1") {
                console.log("I021/020 Emitter Category");
                //length =1
              }
              if (fspec[34] === "1") {
                console.log("I021/220 Met Information");
                //length =1+
              }
              if (fspec[35] === "1") {
                console.log("I021/146 Selected Altitude");
                //length =2
              }
              if (fspec[36] === "1") {
                console.log("I021/148 Final State Selected Altitude");
                //length =2
              }
              if (fspec[37] === "1") {
                console.log("I021/110 Trajectory Intent");
                //length =1+
              }
              if (fspec[38] === "1") {
                console.log("I021/016 Service Management ");
                //length =1
              }
              if (fspec[39] === "1") {
                console.log("Field Extension Indicator");

                if (fspec[40] === "1") {
                  console.log("I021/008 Aircraft Operational Status");
                  //length =1
                }
                if (fspec[41] === "1") {
                  console.log("I021/271 Surface Capabilities and Characteristics");
                  //length =1+
                }
                if (fspec[42] === "1") {
                  console.log("I021/132 Message Amplitude");
                  //length =1
                }
                if (fspec[43] === "1") {
                  console.log("I021/250 Mode S MB Data");
                  //length =1+N*8
                }
                if (fspec[44] === "1") {
                  console.log("I021/260 ACAS Resolution Advisory Report");
                  //length =7
                }
                if (fspec[45] === "1") {
                  console.log("I021/400 Receiver ID");
                  //length =1
                }
                if (fspec[46] === "1") {
                  console.log("I021/295 Data Ages");
                  //length =1+
                }
                if (fspec[47] === "1") {
                  console.log("Field Extension Indicator");

                  /// FRN43 - FRN 47 Not Used
                }
                if (fspec[53] === "1") {
                  console.log("RE Reserved Expansion Field");
                  //length =1+
                }
                if (fspec[54] === "1") {
                  console.log("SP Special Purpose Field");
                  //length =1+
                }
                if (fspec[55] === "1") {
                  console.log("Field Extension Indicator, but no more in the spec");
                }
              }
            }
          }
        }
      }
    }
    a++;
  });
}
function variableItemOffset(buffer: Buffer, max_len: number) {
  const bits = BigInt("0x" + buffer.toString("hex"))
    .toString(2)
    .padStart(max_len * 8, "0")
    .split("");

  let count = 7;
  let found = false;
  let offset = bits.filter((value, index) => {
    if (index == count && !found) {
      if (value != "1") {
        found = true;
      } else {
        count += 8;
      }
      return true;
    }
    return;
  }).length;
  console.log("item offset " + offset);
  return offset;
}
