import { Cat10 } from './cat10_decoder';
import { Cat21 } from './cat21_decoder';
//import { parseCartesianCoordinate, parsePolarCoordinate } from "./cat10_msg_parser";

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

  let test = cat10msg.length - 10;
  let test2 = cat21msg.length - 10;

  // console.log({ cat_21: cat21msg.length });
  var vec: Cat10[] = [];
  let a = 0;
  cat10msg.forEach(
    msg => {
      if (a <= test) {
        //n console.log("MESSAGE " + a);
        const fspec = BigInt('0x' + msg.slice(3, 7).toString('hex')).toString(2).padStart(4 * 8, '0').split('');

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
        //console.log("length fspec " + offset);

        var decod_msg: Cat10 = new Cat10(a);
        var tasks: any[] = [];

        if (fspec[0] === '1') {
          /// I010/010 Data Source Identifier
          tasks.push(decod_msg.set_data_source_identifier(msg.slice(offset, offset + 2)));
          offset += 2; //length =2
        }
        if (fspec[1] === '1') {
          /// I010/000 Message Type
          tasks.push(decod_msg.set_message_type(msg.slice(offset, offset + 1)));
          offset += 1; //length =1

          /// Page 13 -> for Types 002, 003, 004 only present Data Source Identifier, Data Type, Time of Day, System Status (optional in 002).
          if (msg[offset - 1] != 0x01) {
            /// I010/140 Time of Day
            tasks.push(decod_msg.set_time_of_day(msg.slice(offset, offset + 3)));

            if (offset === 9) { // Check if it has System  Status
              /// I010/550 System Status
              tasks.push(decod_msg.set_system_status(msg.slice(offset + 3, offset + 4)));
            }

            Promise.all(tasks).then(() => {
              // console.log(decod_msg);
              vec.push(decod_msg);
              if (decod_msg.id === test) {
                console.log(decod_msg)
                console.log(vec.length);
              }
            });
            a++;
            return;
          }

        }
        // *** Mandatory items ***

        /// I010/020 Target Report Descriptor
        let len = variableItemOffset(msg.slice(offset, offset + 3), 3) // First Part + First Extent + Second Extent => max 3
        tasks.push(decod_msg.set_target_report_description(msg.slice(offset, offset + len)));
        offset += len; //length =1+

        /// "I010/140 Time of Day"
        tasks.push(decod_msg.set_time_of_day(msg.slice(offset, offset + 3)));
        offset += 3; //length =3
        // **********************
        if (fspec[4] === '1') {//TODO
          // console.log("I010/041 Position in WGS-84 Co-ordinates")
          // console.log("	" + msg.slice(offset, offset + 8).toString('hex'));
          offset += 8;
          //length =8
        }
        if (fspec[5] === "1") {//TODO
          //   console.log("I010/040 Measured Position in Polar Co-ordinates");
          //   const buff = msg.slice(offset, offset + 4);
          //   console.log("	" + buff.toString("hex"));
          //   parsePolarCoordinate(buff);
          offset += 4;
          //length =4
        }
        if (fspec[6] === "1") {//TODO
          // console.log("I010/042 Position in Cartesian Co-ordinates");
          // const buff = msg.slice(offset, offset + 4);
          // console.log("	" + buff.toString("hex"));
          // parseCartesianCoordinate(buff);
          offset += 4;
          //length =4
        }
        if (fspec[7] === "1") {
          /**** Field Extension Indicator ****/

          if (fspec[8] === "1") {//TOODO
            // console.log("I010/200 Calculated Track Velocity in Polar Co-ordinates");
            // console.log("	" + msg.slice(offset, offset + 4).toString("hex"));
            offset += 4;
            //length =4
          }
          if (fspec[9] === "1") {//TODO
            // console.log("I010/202 Calculated Track Velocity in Cartesian Coord.");
            // console.log("	" + msg.slice(offset, offset + 4).toString("hex"));
            offset += 4;
            //length =4
          }
          if (fspec[10] === '1') {
            /// I010/161 Track Number
            tasks.push(decod_msg.set_track_number(msg.slice(offset, offset + 2)));
            offset += 2;  //length =2
          }
          if (fspec[11] === '1') {
            /// I010/170 Track Status
            let len = variableItemOffset(msg.slice(offset, offset + 3), 3); // First Part + First Extent + Second Extent => max 3
            tasks.push(decod_msg.set_track_status(msg.slice(offset, offset + len)));
            offset += len; //length =1+
          }
          if (fspec[12] === '1') {
            /// I010/060 Mode-3/A Code in Octal Representation
            tasks.push(decod_msg.set_mod_3A_code(msg.slice(offset, offset + 2)));
            offset += 2; //length =2
          }
          if (fspec[13] === '1') {
            /// I010/220 Target Address
            tasks.push(decod_msg.set_target_address(msg.slice(offset, offset + 3)));
            offset += 3; //length =3
          }
          if (fspec[14] === "1") {
            /// I010/245 Target Identification
            tasks.push(decod_msg.set_target_identification(msg.slice(offset, offset + 7)));
            offset += 7; //length =7
          }
          if (fspec[15] === "1") {
            /**** Field Extension Indicator ****/

            if (fspec[16] === "1") {
              /// I010/250 Mode S MB Data
              const len = buffer.slice(offset, offset + 1).readInt16BE();
              tasks.push(decod_msg.set_mode_s_mb_data(msg.slice(offset + 1, offset + 1 + 8 * len), len));
              offset += 1 + 8 * len; //length =1+8n
            }
            if (fspec[17] === "1") {
              /// I010/300 Vehicle Fleet Identification
              tasks.push(decod_msg.set_vehicle_fleet_identification(msg.slice(offset, offset + 1)));
              offset += 1; //length =1
            }
            if (fspec[18] === '1') {
              /// I010/090 Flight Level in Binary Representation
              tasks.push(decod_msg.set_flight_level(msg.slice(offset, offset + 2)));
              offset += 2; //length =2
            }
            if (fspec[19] === '1') {
              /// I010/091 Measured Height
              tasks.push(decod_msg.set_measured_height(msg.slice(offset, offset + 2)));
              offset += 2; //length =2
            }
            if (fspec[20] === "1") {
              /// I010/270 Target Size & Orientation
              let len = variableItemOffset(msg.slice(offset, offset + 3), 3);// First Part + First Extent + Second Extent => max 3
              tasks.push(decod_msg.set_target_size_and_orientation(msg.slice(offset, offset + len)));
              offset += len; //length =1+
            }
            // Sytem Status -> Delete, never in a target report
            if (fspec[22] === '1') {
              /// I010/310 Pre-programmed Message
              tasks.push(decod_msg.set_preprogrammed_message(msg.slice(offset, offset + 1)));
              offset += 1; //length =1
            }
            if (fspec[23] === "1") {
              /**** Field Extension Indicator ****/

              if (fspec[24] === "1") {
                /// I010/500 Standard Deviation of Position
                tasks.push(decod_msg.set_standard_deviation_of_position(msg.slice(offset, offset + 4)));
                offset += 4; //length =4
              }
              if (fspec[25] === "1") {
                /// I010/280 Presence
                const len = buffer.slice(offset, offset + 1).readInt16BE();
                tasks.push(decod_msg.set_presence(msg.slice(offset + 1, offset + 1 + 2 * len), len));
                offset += 1 + 2 * len; //length =1+2n
              }
              if (fspec[26] === "1") {
                /// I010/131 Amplitude of Primary Plot
                tasks.push(decod_msg.set_alitude_of_primary_plot(msg.slice(offset, offset + 1)));
                offset += 1; //length =1
              }
              if (fspec[27] === "1") {
                /// I010/210 Calculated Acceleration
                tasks.push(decod_msg.set_calculated_acceleration(msg.slice(offset, offset + 2)));
                // offset += 2; //length =2
              }
              //     /*if (fspec[28] === "1") {
              //       console.log("Spare");
              //       //length = Nan
              //     }
              //     if (fspec[29] === "1") {
              //       console.log("SP Special Purpose Field");
              //       //length =1+
              //     }
              //     if (fspec[30] === "1") {
              //       console.log("RE Reserved Expansion Field");
              //       //length =1+
              //     }
              //     if (fspec[31] === "1") {
              //       console.log("Field Extension Indicator, but no more in the spec");
              //     }*/
            }
          }
        }
        Promise.all(tasks).then(() => {
          vec.push(decod_msg);

          if (decod_msg.id === test) {
            console.log(decod_msg)
            console.log(vec.length);
          }
        });
      }
      a++;
    });

  vec.filter((value) => {
    if (value.time_of_day == "08:13:55.648") { return true }
    else { return false }
  })
  // console.log(vec)
  var vec21: Cat21[] = [];
  let b = 0;
  //var test2 = 139747;
  cat21msg.forEach(msg => {
    if (b <= test2) {
      const fspec = BigInt('0x' + msg.slice(3, 10).toString('hex')).toString(2).padStart(7 * 8, '0').split('');

      let count = 7;
      let found = false;
      let offset = fspec.filter((value, index) => {
        if ((index == count) && !found) {
          if (value != '1') {
            found = true;
          } else {
            count += 8;
          }
          return true;
        }
        return
      }).length + 3;
      // console.log("length fspec " + offset);

      var decod_msg: Cat21 = new Cat21(b);
      var tasks: any[] = [];

      /** MANDATORY FIELD**/
      /// I021/010 Data Source Identifier
      tasks.push(decod_msg.set_data_source_identifier(msg.slice(offset, offset + 2)));
      offset += 2; //length =2

      /// I021/040 Target Report Descriptor
      let len = variableItemOffset(msg.slice(offset, offset + 3), 3); // Primary Subfield + First Extension + Second Extension => max3
      tasks.push(decod_msg.set_target_report_descriptor(msg.slice(offset, offset + len)));
      offset += len; //length =1+
      /********************/

      if (fspec[2] === '1') {
        /// I021/161 Track Number
        tasks.push(decod_msg.set_track_number(msg.slice(offset, offset + 2)));
        offset += 2; //length =2
      }
      if (fspec[3] === '1') {
        /// I021/015 Service Identification
        tasks.push(decod_msg.set_service_identification(msg.slice(offset, offset + 1)));
        offset += 1; //length =1
      }
      if (fspec[4] === '1') {
        /// I021/071 Time of Applicability for Position
        tasks.push(decod_msg.set_time_applicability_position(msg.slice(offset, offset + 3)));
        offset += 3; //length =3
      }
      if (fspec[5] === '1') { ///TODO
        // console.log("I021/130 Position in WGS-84 co-ordinates")
        // console.log("	" + msg.slice(offset, offset + 6).toString('hex'));
        offset += 6;
        //length =6
      }
      if (fspec[6] === '1') {///TODO
        // console.log("I021/131 Position in WGS-84 co-ordinates, high res.")
        // console.log("	" + msg.slice(offset, offset + 8).toString('hex'));
        offset += 8;
        //length =8
      }
      if (fspec[7] === '1') {
        // Field Extension Indicator

        if (fspec[8] === '1') {
          /// I021/072 Time of Applicability for Velocity
          tasks.push(decod_msg.set_time_applicability_velocity(msg.slice(offset, offset + 3)));
          offset += 3; //length =3
        }
        if (fspec[9] === '1') {
          /// I021/150 Air Speed
          tasks.push(decod_msg.set_air_speed(msg.slice(offset, offset + 2)));
          offset += 2; //length =2
        }
        if (fspec[10] === '1') {
          /// I021/151 True Air Speed
          tasks.push(decod_msg.set_true_airspeed(msg.slice(offset, offset + 2)));
          offset += 2; //length =2
        }
        /** MANDATORY ITEM **/
        /// I021/080 Target Address
        tasks.push(decod_msg.set_target_address(msg.slice(offset, offset + 3)));
        offset += 3; //length =3
        /*******************/
        if (fspec[12] === '1') {
          /// I021/073 Time of Message Reception of Position
          tasks.push(decod_msg.set_time_message_reception_position(msg.slice(offset, offset + 3)));
          offset += 3; //length =3
        }
        if (fspec[13] === '1') {
          /// I021/074 Time of Message Reception of Position-High
          tasks.push(decod_msg.set_time_message_reception_position_high(msg.slice(offset, offset + 4)));
          offset += 4; //length =4
        }
        if (fspec[14] === '1') {
          /// I021/075 Time of Message Reception of Velocity
          tasks.push(decod_msg.set_time_message_reception_velocity(msg.slice(offset, offset + 3)));
          offset += 3; //length =3
        }
        if (fspec[15] === '1') {
          /// Field Extension Indicator

          if (fspec[16] === '1') {
            /// I021/076 Time of Message Reception of Velocity-High Precision
            tasks.push(decod_msg.set_time_message_reception_velocity_high(msg.slice(offset, offset + 4)));
            offset += 4; //length =4
          }
          if (fspec[17] === '1') {
            /// I021/140 Geometric Height
            tasks.push(decod_msg.set_geometric_height(msg.slice(offset, offset + 2)));
            offset += 2; //length =2
          }
          /*** MANDATORY ITEM ***/
          /// I021/090 Quality Indicators
          let len = variableItemOffset(msg.slice(offset, offset + 4), 4); // Primary Subfield + First extension + Second extension + Third Extension => max 4
          tasks.push(decod_msg.set_quality_indicator(msg.slice(offset, offset + len)));
          offset += len; //length =1+
          /*********************/
          if (fspec[19] === '1') {
            /// I021/210 MOPS Version
            tasks.push(decod_msg.set_mops_version(msg.slice(offset, offset + 1)));
            offset += 1; //length =1
          }
          if (fspec[20] === '1') {
            /// I021/070 Mode 3/A Code
            tasks.push(decod_msg.set_mod_3A_code(msg.slice(offset, offset + 2)));
            offset += 2; //length =2
          }
          if (fspec[21] === '1') {
            /// I021/230 Roll Angle
            tasks.push(decod_msg.set_roll_angle(msg.slice(offset, offset + 2)));
            offset += 2; //length =2
          }
          if (fspec[22] === '1') {
            /// I021/145 Flight Level
            tasks.push(decod_msg.set_flight_level(msg.slice(offset, offset + 2)));
            offset += 2; //length =2
          }
          if (fspec[23] === '1') {
            /// Field Extension Indicator

            if (fspec[24] === '1') {
              /// I021/152 Magnetic Heading
              tasks.push(decod_msg.set_magnetic_heading(msg.slice(offset, offset + 2)));
              offset += 2; //length =2
            }
            if (fspec[25] === '1') {
              /// I021/200 Target Status
              tasks.push(decod_msg.set_target_status(msg.slice(offset, offset + 1)));
              offset += 1; //length =1
            }
            if (fspec[26] === '1') {
              /// I021/155 Barometric Vertical Rate
              tasks.push(decod_msg.set_barometric_vertical_rate(msg.slice(offset, offset + 2)));
              offset += 2; //length =2
            }
            if (fspec[27] === '1') {
              /// I021/157 Geometric Vertical Rate
              tasks.push(decod_msg.set_geometric_vertical_rate(msg.slice(offset, offset + 2)));
              offset += 2; //length =2
            }
            if (fspec[28] === '1') {
              /// I021/160 Airborne Ground Vector
              tasks.push(decod_msg.set_airborne_ground_vector(msg.slice(offset, offset + 4)));
              offset += 4; //length =4
            }
            if (fspec[29] === '1') {
              /// I021/165 Track Angle Rate
              tasks.push(decod_msg.set_track_angle_rate(msg.slice(offset, offset + 2)));
              offset += 2; //length =2
            }
            if (fspec[30] === '1') {
              /// I021/077 Time of Report Transmission
              tasks.push(decod_msg.set_time_ASTERIX_report_transmission(msg.slice(offset, offset + 3)));
              offset += 3; //length =3
            }
            if (fspec[31] === '1') {
              /// Field Extension Indicator

              if (fspec[32] === '1') {
                /// I021/170 Target Identification
                tasks.push(decod_msg.set_target_identification(msg.slice(offset, offset + 6)));
                offset += 6; //length =6
              }
              if (fspec[33] === '1') {
                /// I021/020 Emitter Category
                tasks.push(decod_msg.set_emitter_category(msg.slice(offset, offset + 1)));
                offset += 1; //length =1
              }
              if (fspec[34] === '1') {
                /// I021/220 Met Information
                let fields: string[] = []; // Primary Subfield + 2* Subfield #1 + 2* Subfield #2 + 2* Subfield #3 + Subfield #4 => max 8
                let len = 1;
                BigInt('0x' + buffer.toString('hex')).toString(2).padStart(8, '0').split('').forEach((value, index) => {
                  switch (index) {
                    case 0: if (value === '1') { fields.push('WS') }
                      break;
                    case 1: if (value === '1') { fields.push('WD') }
                      break;
                    case 2: if (value === '1') { fields.push('TMP') }
                      break;
                    case 3: if (value === '1') { fields.push('TRB'); len--; } //only one octet
                      break;
                  }
                });
                tasks.push(decod_msg.set_met_information(msg.slice(offset + 1, offset + fields.length * 2 + len), fields));
                offset += fields.length * 2 + len; //length =1+
              }
              if (fspec[35] === '1') {
                /// I021/146 Selected Altitude
                tasks.push(decod_msg.set_selected_altitude(msg.slice(offset, offset + 2)));
                offset += 2; //length =2
              }
              if (fspec[36] === '1') {
                /// I021/148 Final State Selected Altitude
                tasks.push(decod_msg.set_final_state_selected_altitude(msg.slice(offset, offset + 2)));
                offset += 2; //length =2
              }
              if (fspec[37] === '1') {
                /// I021/110 Trajectory Intent
                /// Primary Subfield + Subfield #1 + 16 * Subfield #2 => max 18
                const bits = BigInt('0x' + msg.slice(offset, offset + 1).toString('hex')).toString(2).padStart(8, '0').split('');
                let len = 0;
                let tis = false;
                let tid = false
                var rep = 0;
                if (bits[0] === '1') { len++; tis = true; }
                if (bits[1] === '1') {
                  rep = buffer.slice(offset + 1 + len, offset + 2 + len).readInt16BE();
                  len += 15 * rep;
                  tid = true;
                }
                tasks.push(decod_msg.set_tarjectory_intent(msg.slice(offset + 1, offset + len + 1), tis, tid, rep));
                offset += len + 1; //length =1+
              }
              if (fspec[38] === '1') {
                /// I021/016 Service Management
                tasks.push(decod_msg.set_service_management(msg.slice(offset, offset + 1)));
                offset += 1; //length =1
              }
              if (fspec[39] === '1') {
                /// Field Extension Indicator

                if (fspec[40] === '1') {
                  /// I021/008 Aircraft Operational Status
                  tasks.push(decod_msg.set_aircraft_operational_status(msg.slice(offset, offset + 1)));
                  offset += 1; //length =1
                }
                if (fspec[41] === '1') {
                  /// I021/271 Surface Capabilities and Characteristics
                  let len = variableItemOffset(msg.slice(offset, offset + 2), 2); // Primary Subfield + First extension => max 2
                  tasks.push(decod_msg.set_surface_capabilities_and_characteristics(msg.slice(offset, offset + len)));
                  offset += len; //length =1+
                } if (fspec[42] === '1') {
                  /// I021/132 Message Amplitude
                  tasks.push(decod_msg.set_message_amplitude(msg.slice(offset, offset + 1)));
                  offset += 1; //length =1
                } if (fspec[43] === '1') {
                  /// I021/250 Mode S MB Data
                  const len = buffer.slice(offset, offset + 1).readInt16BE();
                  tasks.push(decod_msg.set_mode_s_mb_data(msg.slice(offset + 1, offset + 1 + 8 * len), len));
                  offset += 1 + 8 * len; //length =1+8n
                } if (fspec[44] === '1') {//TODO
                  //console.log("I021/260 ACAS Resolution Advisory Report")
                  //console.log("	" + msg.slice(offset, offset + 7).toString('hex'));
                  offset += 7;
                  //length =7
                } if (fspec[45] === '1') {
                  /// I021/400 Receiver ID
                  tasks.push(decod_msg.set_receiver_ID(msg.slice(offset, offset + 1)));
                  offset += 1;
                  //length =1
                } if (fspec[46] === '1') {//TODO
                  //console.log("I021/295 Data Ages")
                  /// 4 octets to indicate octates presence
                  //let offsetDA = variableItemOffsetDataAges(msg.slice(offset, offset + 4));
                  //console.log("	" + msg.slice(offset, offset + offsetDA.Offset + offsetDA.Items).toString('hex'));
                  //offset += len; //length =1+
                }
                /*if (fspec[47] === '1') {
                  console.log("Field Extension Indicator")

                  /// FRN43 - FRN 47 Not Used
                } if (fspec[53] === '1') {
                  console.log("RE Reserved Expansion Field")
                  //length =1+
                } if (fspec[54] === '1') {
                  console.log("SP Special Purpose Field")
                  //length =1+
                } if (fspec[55] === '1') {
                  console.log("Field Extension Indicator, but no more in the spec")

                }*/
              }
            }
          }
        }
      }
      Promise.all(tasks).then(() => {
        vec21.push(decod_msg);


        if (decod_msg.id === test2) {
          console.log(decod_msg)
          console.log(vec21.length);
        }
      });

    } b++;
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
  //console.log("item offset " + offset);
  return offset;
}

// function variableItemOffsetDataAges(buffer: Buffer) {
//   const bits = BigInt("0x" + buffer.toString("hex"))
//     .toString(2)
//     .padStart(4 * 8, "0")
//     .split("");

//   let count = 7;
//   let items = 0;
//   let found = false;
//   let offset = bits.filter((value, index) => {
//     if (index == count && !found) {
//       if (value != "1") {
//         found = true;
//       } else {
//         count += 8;
//       }
//       return true;
//     }
//     else {
//       if (value == "1") {
//         items++;
//       }
//     }
//     return;
//   }).length;
//   return { Offset: offset, Items: items };
// }
// export interface OffsetDA {
//   Offset: number;
//   Items: number;
// }
