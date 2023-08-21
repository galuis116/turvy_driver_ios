import React, { useEffect, useState, useRef } from "react";

import {
  Provider as PaperProvider,
  Avatar,
  Caption,
  Surface,
  IconButton,
  Colors,
  Appbar,
  TextInput,
  Button,
} from "react-native-paper";

import {
  View,
  ScrollView,
  Picker,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";

import BottomSheet from "reanimated-bottom-sheet";
import { styles, theme, DOMAIN } from "./Constant";
import { Input } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Row, Col } from "react-native-easy-grid";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";

import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";
import DatePicker from "react-native-datepicker";
import * as ImagePicker from "expo-image-picker";
import Spinner from "react-native-loading-spinner-overlay";

const StatusBarheight = StatusBar.currentHeight + 50;

export default class Documents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      abnData: "",
      commentDataError: "",
      docImg: false,
      expireDate: "",
      date: new Date(),
      open: false,
      mode: "date",
      documentList: {},
      driverId: "",
      spinner: true,
      showBottomSheet: false,
      screenHeight: "86%",
      selectedIndex: 1,
      selectedItem: {},
    };
  }

  async componentDidMount() {
    await AsyncStorage.getItem("driverId").then((value) => {
      if (value != "" && value !== null) {
        this.setState({
          driverId: value,
        });
      }
    });

    await AsyncStorage.getItem("accesstoken").then((value) => {
      fetch(DOMAIN + "api/driver/documents", {
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
          //console.log('profile info:',res);
          this.setState({
            documentList: res.data,
            spinner: false,
          });
        });
    });

    //console.log('date',this.state.date)
  }

  handleUpdateDocument = async () => {
    this.setState({ spinner: true });
    let localUri =
      this.state.documentList[this.state.selectedIndex].document_url;
    console.log("localUri", localUri);
    if (localUri == "") {
      this.setState({ spinner: false });
      this.refs.commentMessage.showMessage({
        message: "Please input your document image",
        type: "danger",
        color: "#ffffff", // text color
        hideOnPress: true,
        animated: true,
        duration: 3000,
        icon: "danger",
        floating: true,
        statusBarHeight: false,
        style: {
          alignContent: "center",
          justifyContent: "center",
          marginTop: 20,
          alignItems: "center",
        },
      });
      return;
    }
    let filename = localUri.split("/").pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;
    let formData = new FormData();
    formData.append("document", { uri: localUri, name: filename, type });
    formData.append(
      "document_expiredate",
      this.state.documentList[this.state.selectedIndex].document_expire_date
    );

    return await AsyncStorage.getItem("accesstoken").then((value) => {
      fetch(
        `${DOMAIN}api/driver/documents/${this.state.selectedItem.document_id}/${this.state.driverId}/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer " + value,
          },
        }
      )
        .then(function (response) {
          return response.json();
        })
        .then((result) => {
          this.setState({ spinner: false });
          console.log("documentUpdateResutl", result);
          if (result.status == 1) {
            this.refs.commentMessage.showMessage({
              message: "Document updated successively",
              type: "success",
              color: "#ffffff", // text color
              hideOnPress: true,
              animated: true,
              duration: 3000,
              icon: "danger",
              floating: true,
              statusBarHeight: false,
              style: {
                alignContent: "center",
                justifyContent: "center",
                marginTop: 20,
                alignItems: "center",
              },
            });
          } else {
            this.setState({ spinner: false });
            this.refs.commentMessage.showMessage({
              message: "Updating Document Failed",
              type: "danger",
              color: "#ffffff", // text color
              hideOnPress: true,
              animated: true,
              duration: 3000,
              icon: "danger",
              floating: true,
              statusBarHeight: false,
              style: {
                alignContent: "center",
                justifyContent: "center",
                marginTop: 20,
                alignItems: "center",
              },
            });
          }
        })
        .catch((e) => {
          this.setState({ spinner: false });
          this.refs.commentMessage.showMessage({
            message: "Updating Document Failed",
            type: "danger",
            color: "#ffffff", // text color
            hideOnPress: true,
            animated: true,
            duration: 3000,
            icon: "danger",
            floating: true,
            statusBarHeight: false,
            style: {
              alignContent: "center",
              justifyContent: "center",
              marginTop: 20,
              alignItems: "center",
            },
          });
        });
    });
  };

  handledDateChange = (date, i, document_id) => {
    //alert(document_id)
    this.state.documentList[i].document_expire_date = date;
    this.setState({
      documentList: this.state.documentList,
    });
  };

  uploadDocument = async (i, document_id) => {
    //alert(document_id)
    // this.setState({ spinner: true });
    let _image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    //console.log(_image);
    if (_image.cancelled) {
      this.setState({ spinner: false });
      return;
    }
    if (!_image.cancelled) {
      this.state.documentList[i].document_url = _image.uri;
      this.setState({
        documentList: this.state.documentList,
      });
    }

    this.setState({ spinner: false });
  };

  renderBottomSheet = () => {
    const { selectedIndex, selectedItem } = this.state;
    console.log("selectedItem", selectedItem);
    return (
      <ScrollView
        style={{ zIndex: 200, borderBottomWidth: 3, borderRadius: 10 }}
      >
        <Appbar.Header style={{ backgroundColor: "#003C77" }} mode="small">
          <Appbar.BackAction
            onPress={() => this.setState({ showBottomSheet: false })}
          />
          <Appbar.Content
            title="Turvy"
            style={{ marginLeft: 0, paddingLeft: 0 }}
          />
        </Appbar.Header>
        <Surface style={[stylesinp.surface, [{ marginVertical: 0 }]]}>
          <View style={{ marginTop: 10 }}>
            <Text style={{ textAlign: "center" }}>
              {selectedItem.document_name}
            </Text>
            <Text
              style={{
                marginVertical: 10,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              {selectedItem.document_title}
            </Text>
            <Text style={{ textAlign: "justify" }}>
              {selectedItem.document_description}
            </Text>

            {selectedItem.document_imageurl ? (
              <>
                <View style={{ flexDirection: "row", marginVertical: 10 }}>
                  <AntDesign name="infocirlce" size={22} color="blue" />
                  <Text style={{ marginLeft: 5, color: "blue" }}>
                    What is this?
                  </Text>
                </View>
                <Image
                  source={{ uri: selectedItem.document_imageurl }}
                  style={{
                    alignItems: "center",
                    width: 300,
                    height: 300,
                    borderRadius: 5,
                  }}
                  resizeMode="cover"
                />
              </>
            ) : null}
          </View>
          <TouchableOpacity
            style={{ marginVertical: 10 }}
            onPress={() => {
              this.uploadDocument(selectedIndex, selectedItem.document_id);
            }}
          >
            {selectedItem.document_url ? (
              <>
                {/* {selectedItem.document_status == 1 ? (
                  <Text
                    style={{
                      textAlign: "center",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      width: 100,
                      borderRadius: 10,
                      alignSelf: "center",
                    }}
                  >
                    Approved
                  </Text>
                ) : (
                  <Text
                    style={{
                      textAlign: "center",
                      backgroundColor: "#F44336",
                      color: "white",
                      width: 100,
                      borderRadius: 10,
                      alignSelf: "center",
                    }}
                  >
                    Pending
                  </Text>
                )} */}
                <Image
                  source={{ uri: selectedItem.document_url }}
                  style={{
                    alignItems: "center",
                    width: 300,
                    height: 300,
                    borderRadius: 5,
                  }}
                  resizeMode="cover"
                />
              </>
            ) : (
              <Image
                source={require("../assets/no-image.png")}
                style={{
                  alignItems: "center",
                  width: 224,
                  height: 244,
                  borderRadius: 5,
                }}
              />
            )}
          </TouchableOpacity>
          {/* <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ marginRight: 10 }}>Expire Date:</Text>
            <DatePicker
              date={selectedItem.document_expire_date}
              mode="date"
              placeholder="select date"
              format="YYYY-MM-DD"
              androidMode="spinner"
              customStyles={{
                dateIcon: {
                  position: "absolute",
                  left: 0,
                  top: 4,
                  marginLeft: 0,
                },
                dateInput: {
                  marginLeft: 0,
                },
              }}
              onDateChange={(date) => {
                this.handledDateChange(
                  date,
                  selectedIndex,
                  selectedItem.document_id
                );
              }}
            />
          </View> */}
          <Button
            mode="contained"
            uppercase={false}
            color={"#135AA8"}
            style={{ marginVertical: 10 }}
            onPress={() => {
              this.handleUpdateDocument();
            }}
          >
            Upload photo
          </Button>
        </Surface>
      </ScrollView>
    );
  };
  //'First name is required'
  render() {
    return (
      <>
        <PaperProvider theme={theme}>
          <Spinner
            visible={this.state.spinner}
            color="#FFF"
            overlayColor="rgba(0, 0, 0, 0.5)"
          />
          <Appbar.Header style={{ backgroundColor: "#fff" }}>
            <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Documents" />
          </Appbar.Header>

          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={{ flex: 1, marginTop: 20 }}>
              {Object.keys(this.state.documentList).length > 0
                ? this.state.documentList.map((item, index) => {
                    return (
                      <View
                        style={[
                          stylesinp.surface,
                          [
                            {
                              padding: 5,
                              backgroundColor:
                                item?.document_status == 1
                                  ? "#e4d1d1"
                                  : "#f7f5f0",
                            },
                          ],
                        ]}
                      >
                        <TouchableOpacity
                          style={{
                            marginVertical: 10,
                            marginLeft: 10,
                            height: 40,
                          }}
                          onPress={() => {
                            this.setState({
                              selectedIndex: index,
                              selectedItem: item,
                              showBottomSheet: true,
                            });
                          }}
                        >
                          <Row
                            style={{
                              width: "100%",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Col size={9}>
                              <Text style={{ paddingHorizontal: 2 }}>
                                {item.document_name}
                              </Text>
                            </Col>
                            <Col size={3}>
                              {item?.document_status == 1 ? (
                                <View
                                  style={{
                                    backgroundColor: "green",
                                    borderRadius: 10,
                                  }}
                                >
                                  <Text
                                    style={{
                                      textAlign: "center",
                                      color: "white",
                                      width: 80,
                                      alignSelf: "center",
                                    }}
                                  >
                                    Approved
                                  </Text>
                                </View>
                              ) : item?.document_status == 0 ? (
                                <View
                                  style={{
                                    backgroundColor: "#F44336",
                                    borderRadius: 10,
                                  }}
                                >
                                  <Text
                                    style={{
                                      textAlign: "center",
                                      color: "white",
                                      width: 80,
                                      alignSelf: "center",
                                    }}
                                  >
                                    Pending
                                  </Text>
                                </View>
                              ) : null}
                            </Col>
                          </Row>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                : null}
            </View>
          </ScrollView>

          {this.state.showBottomSheet ? (
            <>
              <BottomSheet
                snapPoints={[this.state.screenHeight]}
                borderRadius={20}
                renderContent={this.renderBottomSheet}
                overdragResistanceFactor={0}
                enabledManualSnapping={false}
                enabledContentTapInteraction={false}
                enabledContentGestureInteraction={false}
              />
            </>
          ) : null}
        </PaperProvider>
        <FlashMessage
          position="top"
          ref="commentMessage"
          style={{ marginTop: StatusBarheight, borderRadius: 2 }}
        />
      </>
    );
  }
}
const stylesinp = StyleSheet.create({
  textInput: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    paddingHorizontal: 20,
    marginHorizontal: 0,
    padding: 10,
    marginTop: 8,
    height: 150,
    width: 250,
  },
  surface: {
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    borderRadius: 5,
    marginHorizontal: 10,
    marginVertical: 10,
  },
});
