import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  Provider as PaperProvider,
  Text,
  Button,
  Appbar,
  Card,
  Title,
  Paragraph,
  TouchableRipple,
} from "react-native-paper";
import {
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Image,
  TouchableHighlight,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { styles, theme, DOMAIN } from "./Constant";
import Fontisto from "react-native-vector-icons/Fontisto";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { Badge } from "react-native-elements";
import { Col, Row, Grid } from "react-native-easy-grid";
import { LinearGradient } from "expo-linear-gradient";
import Spinner from "react-native-loading-spinner-overlay";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import firestore from "@react-native-firebase/firestore";

import * as firebase from "firebase";
import "firebase/firestore";

import apiKeys from "./config/keys";
import * as geofirestore from "geofirestore";

if (!firebase.apps.length) {
  console.log("Connected with Firebase");
  firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firestore();
//const firestore = firebase.firestore();
const GeoFirestore = geofirestore.initializeApp(db);

export default class Recommended extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accessTokan: "",
      bookrequest: {},
      fetchnewrequest: true,
      driverId: "",
      destination: {},
      origin: {},
      spinner: false,
      peaktime: null,
      mypoints: 1500,
      qualifyPoints: 1680,
      totalPoints: 2880,
      declineCounts: 0,
      screen: this.props.route.params.screen,
    };
  }

  async componentDidMount() {
    console.log("screen=============: ", this.props.route.params.screen);
    await AsyncStorage.getItem("accesstoken").then((value) => {
      if (value != "" && value !== null) {
        this.setState(
          {
            accessTokan: value,
          },
          () => {
            this._getLoyalty();
            this._getPeaktime();
          }
        );
      }
    });
    await AsyncStorage.getItem("driverId").then((value) => {
      if (value != "" && value !== null) {
        this.setState({ driverId: value });
      }
    });
  }

  _getLoyalty = async () => {
    await fetch(DOMAIN + "api/driver/loyalty", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + this.state.accessTokan,
      },
    })
      .then(function (response) {
        return response.json();
      })
      .then((result) => {
        console.log("driver_loyalty", result);
        const { totalPoints, qualifyPoints, declineCounts } = result.data;
        this.setState({
          totalPoints,
          qualifyPoints,
          declineCounts,
        });
      });
  };

  _getPeaktime = async () => {
    await fetch(DOMAIN + "api/driver/peaktime", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + this.state.accessTokan,
      },
    })
      .then(function (response) {
        return response.json();
      })
      .then((result) => {
        console.log("driver_state", result);
        this.setState({
          peaktime: result.data,
        });
      });
  };

  async goOffline() {
    this.setState({ spinner: true });
    db.collection("driver_locations").doc(this.state.driverId).delete();

    AsyncStorage.setItem("isOnline", "false");

    await fetch(DOMAIN + "api/driver/offline", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + this.state.accessTokan,
      },
    })
      .then(function (response) {
        return response.json();
      })
      .then((result) => {
        this.setState({ spinner: false });
        if (result.status === 1) {
          AsyncStorage.removeItem("driver_timeout");
          this.props.navigation.replace("MapViewOffline");
        }
      });
  }

  render() {
    return (
      <>
        <Spinner
          visible={this.state.spinner}
          color="#FFF"
          overlayColor="rgba(0, 0, 0, 0.5)"
        />
        <StatusBar style="auto" />
        <Appbar.Header style={{ backgroundColor: "#FFF" }}>
          <AntDesign
            name="arrowleft"
            size={24}
            color="black"
            style={{ paddingLeft: 10 }}
            onPress={() => this.props.navigation.goBack(null)}
          />
          <Appbar.Content
            title="Recommended for you"
            titleStyle={{ textAlign: "center", alignContent: "center" }}
          />
          <FontAwesome
            name="search"
            style={{
              color: "#fff",
              fontSize: 25,
              paddingLeft: 15,
              width: 50,
              textAlign: "left",
            }}
            color="#111"
          />
        </Appbar.Header>
        <PaperProvider theme={theme}>
          <ScrollView style={{ backgroundColor: "aliceblue" }}>
            <View style={styles.content}>
              {/* <TouchableOpacity 
			        		onPress={() => this.props.navigation.navigate('CurrentQuest')}
			        		style={pageStyles.promoBox}>
			        		<View style={{flexDirection:'row',alignItems:'center'}}>
			        			<Text style={{width:20}}><AntDesign name="star" size={15} color="black" /></Text>
			        			<Text>Promotion</Text>
			        		</View>
			        		<View style={{marginVertical:5}}>
			        			<Text style={{fontSize:20,letterSpacing:0.5,color:'#5b5b5b'}}>Complete 19 trips for $35 extra</Text>
			        		</View>
			        		<View>
			        			<Text style={{lineHeight: 20,color:'#797979'}}>Quest ends Monday 4:00 AM</Text>
			        		</View>
			        	</TouchableOpacity> */}
              {/* {this.state.peaktime ? (
                <>
                  <View style={{ height: 20 }}></View>
                  <View style={pageStyles.promoBox}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={{ width: 20 }}>
                        <AntDesign name="star" size={15} color="black" />
                      </Text>
                      <Text>Opportunity</Text>
                    </View>
                    <View style={{ marginVertical: 5 }}>
                      <Text
                        style={{
                          fontSize: 20,
                          letterSpacing: 0.5,
                          color: "#5b5b5b",
                        }}
                      >
                        Peak flight hours at MSP
                      </Text>
                    </View>
                    <View>
                      <Text style={{ lineHeight: 20, color: "#797979" }}>
                        {this.state.peaktime.str}
                      </Text>
                    </View>
                  </View>
                </>
              ) : null} */}
              <View style={pageStyles.promoBox}>
                <Row
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Col size={2}>
                    <MaterialCommunityIcons
                      name="pentagon"
                      size={24}
                      color="blue"
                    />
                  </Col>
                  <Col size={7}>
                    <View style={{ marginHorizontal: 0 }}>
                      <Text>Unlock Loyality</Text>
                      <Text>{this.state.declineCounts}</Text>
                    </View>
                  </Col>
                  <Col size={2}>
                    <MaterialCommunityIcons
                      name="hexagon"
                      size={24}
                      color={
                        this.state.mypoints < this.state.qualifyPoints
                          ? "#6638d9"
                          : "green"
                      }
                    />
                  </Col>
                  <Col size={6}>
                    <Text style={{ fontSize: 15 }}>
                      {this.state.mypoints} / {this.state.totalPoints} pts
                    </Text>
                  </Col>
                </Row>
              </View>
              <View style={{ height: 20 }}></View>
              <View style={pageStyles.promoBox}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate("DrivingTime")}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Text style={{ width: 30 }}>
                    <MaterialCommunityIcons
                      name="steering"
                      size={20}
                      color="black"
                    />
                  </Text>
                  <Text style={{ fontSize: 17 }}>See Driving Time</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 20 }}></View>
              <View style={pageStyles.promoBox}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate("LastTrip")}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Text style={{ width: 30 }}>
                    <AntDesign name="profile" size={20} color="black" />
                  </Text>
                  <Text style={{ fontSize: 17 }}>Waybill</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          {this.state.screen != "offline" && (
            <Card
              mode="elevated"
              style={[styles.boxShadow, { marginBottom: 0 }]}
            >
              <Card.Content>
                <View style={pageStyles.tripTab}>
                  <View
                    style={[
                      pageStyles.tripTabChild,
                      { alignItems: "flex-start" },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate("DriverPreferences")
                      }
                    >
                      <Image
                        style={{ width: 25, height: 25 }}
                        source={require("../assets/swapIcon.png")}
                      />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[pageStyles.tripTabChild, { alignItems: "center" }]}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        this.goOffline();
                      }}
                    >
                      <View>
                        <View style={pageStyles.offIcon}>
                          <View
                            style={{
                              backgroundColor: "#135aa8",
                              borderRadius: 50,
                              alignItems: "center",
                              justifyContent: "center",
                              width: 50,
                              height: 50,
                            }}
                          >
                            <FontAwesome
                              name="hand-paper-o"
                              size={25}
                              color="#FFF"
                            />
                          </View>
                        </View>
                        <Text style={{ marginTop: 5, fontSize: 18 }}>
                          Go Offline
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[
                      pageStyles.tripTabChild,
                      { alignItems: "flex-end" },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        this.props.navigation.navigate("SearchDest");
                      }}
                    >
                      <AntDesign name="search1" size={25} color="#135aa8" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
        </PaperProvider>
      </>
    );
  }
}

const pageStyles = StyleSheet.create({
  tripTab: {
    flexDirection: "row",
  },
  tripTabChild: {
    flex: 1,
    justifyContent: "center",
  },
  offIcon: {
    borderWidth: 1,
    borderColor: "#CCC",
    padding: 5,
    borderRadius: 50,
    backgroundColor: "#FFF",
    color: "#FFF",
    elevation: 8,
    width: 62,
    height: 62,
    alignSelf: "center",
  },
  offlineBtn: {
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 50,
  },
  promoBox: {
    backgroundColor: "#FFF",
    padding: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
  },
});
