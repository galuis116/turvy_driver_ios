import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, View, Text, Alert } from "react-native";
import { Audio } from "expo-av";
import * as firebase from "firebase";
import "firebase/firestore";
const db = firebase.firestore();
import { theme, DOMAIN, PUSHER_API } from "./Constant";

import Pusher from "pusher-js/react-native";
export default class CheckDrivingTime extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeData: false,
      drivingTime: 0.0,
      offlineTime: 0.0,
      accessTokan: "",
      showAlert: false,
      alertTime: 30 * 60,
      alertTone: true,
    };
  }

  componentDidMount = () => {
    this._checkDrivingTime();

    this.drivingInterval = setInterval(() => {
      this._checkDrivingTime();
      //console.log('screen name:',this.props.route.name);
    }, 60000);
    var pusher = new Pusher(PUSHER_API.APP_KEY, {
      cluster: PUSHER_API.APP_CLUSTER,
    });
    var channel = pusher.subscribe("turvy-channel");

    channel.bind("admin_block_driver", this.handleAdminBlock);
    channel.bind("admin_suspend_driver", this.handleAdminSuspend);
  };

  handleAdminBlock = async (data) => {
    AsyncStorage.getItem("driverId").then((value) => {
      if (value != "" && value !== null) {
        if (data.id == value) {
          let title =
            data.status == "blocked"
              ? "Your Account Is Blocked"
              : "Your Account Is Activated.";
          let description =
            data.status == "blocked"
              ? "Please contact administration"
              : "Please go online to start accepting jobs";
          Alert.alert(title, description, [
            {
              text: "Ok",
              onPress: () => null,
              style: "cancel",
            },
          ]);
          if (data.status == "blocked") {
            db.collection("driver_locations").doc(value).delete();
            AsyncStorage.setItem("status", "blocked");
            AsyncStorage.getItem("accesstoken").then((token) => {
              if (token != "" && token !== null) {
                fetch(DOMAIN + "api/driver/offline", {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: "Bearer " + token,
                  },
                })
                  .then(function (response) {
                    return response.json();
                  })
                  .then((result) => {
                    console.log("offline", result);
                    AsyncStorage.setItem("isOnline", "false");
                  })
                  .catch((e) => {
                    AsyncStorage.setItem("isOnline", "false");
                  });
                this.props.navigation.navigate("MapViewOffline", {
                  showBlocked: true,
                });
              }
            });
          } else {
            AsyncStorage.setItem("status", "active");
            this.props.navigation.navigate("MapViewOffline", {
              showBlocked: false,
            });
          }
        }
      }
    });
  };

  handleAdminSuspend = async (data) => {
    AsyncStorage.getItem("driverId").then((value) => {
      if (value != "" && value !== null) {
        if (data.id == value) {
          if (data.status == "suspend") {
            db.collection("driver_locations").doc(value).delete();
            AsyncStorage.getItem("accesstoken").then((token) => {
              if (token != "" && token !== null) {
                fetch(DOMAIN + "api/driver/offline", {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: "Bearer " + token,
                  },
                })
                  .then(function (response) {
                    return response.json();
                  })
                  .then((result) => {
                    console.log("offline", result);
                    AsyncStorage.setItem("isOnline", "false");
                  })
                  .catch((e) => {
                    AsyncStorage.setItem("isOnline", "false");
                  });
                this.props.navigation.navigate("MapViewOffline", {
                  showSuspended: true,
                });
              }
            });
          } else {
            // this.props.navigation.navigate("MapViewOffline", {
            //   showSuspended: false,
            // });
          }
        }
      }
    });
  };

  _checkDrivingTime = async () => {
    await AsyncStorage.getItem("accesstoken").then((value) => {
      fetch(DOMAIN + "api/driver/checkDrivingTime", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + value,
        },
      })
        .then(function (response) {
          return response.json();
        })
        .then((res) => {
          console.log("_checkDrivingTime loop global:", res);
          if (res.status == 1) {
            this.setState({
              timeData: res.data,
            });
            if (
              (res.data.driving_time >= this.state.alertTime - 100 &&
                res.data.driving_time <= this.state.alertTime + 100) ||
              (res.data.driving_time >= 60 * 60 - 10 &&
                res.data.driving_time <= 60 * 60 + 55) ||
              (res.data.driving_time >= 60 * 120 - 10 &&
                res.data.driving_time <= 60 * 120 + 55)
            ) {
              this.setState(
                {
                  showAlert: true,
                },
                () => {
                  if (this.state.alertTone) {
                    this.alertTone();
                  }
                }
              );
            }

            if (res.data.driving_time <= 0) {
              this.setState({
                showAlert: false,
              });
            }
          }
        });
    });
  };

  alertTone = async () => {
    const { sound: playbackObject } = await Audio.Sound.createAsync(
      require("../assets/cancel_notice.mp3"),
      {}
    );

    this.setState({
      toneObject: playbackObject,
      alertTone: false,
    });

    await playbackObject.playAsync();
    playbackObject.setIsLoopingAsync(true);
    setTimeout(() => {
      playbackObject.stopAsync(false);
    }, 5000);
  };

  render() {
    if (this.state.timeData) {
      let avlstr = this.state.timeData.driving_time_text;
      if (avlstr) {
        avlstr = avlstr.replace("0 hr ", "");
      }
      return (
        <>
          {this.state.showAlert ? (
            <View
              style={{
                position: "absolute",
                zIndex: 100,
                top: "10%",
                alignItems: "center",
                height: "auto",
                backgroundColor: "transparent",
                alignSelf: "center",
                width: 280,
              }}
            >
              <View
                style={{
                  backgroundColor: "red",
                  borderRadius: 5,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  borderColor: "#FFF",
                  borderWidth: 3,
                  elevation: 5,
                  alignItems: "center",
                  marginVertical: 5,
                }}
              >
                <Text style={{ color: "#FFF", fontSize: 18 }}>
                  Driving time available {avlstr}
                </Text>
              </View>
              <Text style={{ textAlign: "center" }}>
                After that, your app will go offline
              </Text>
              <Button
                mode="contained"
                color={"#135AA8"}
                style={{ width: 250, marginVertical: 10 }}
                onPress={() => {
                  this.setState({ showAlert: false });
                }}
              >
                OK
              </Button>
            </View>
          ) : null}
        </>
      );
    } else {
      return null;
    }
  }
}
