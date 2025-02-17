import React,{Component} from "react";
import { StatusBar, View, FlatList, TouchableWithoutFeedback, TouchableOpacity} from "react-native";
import { Text , Divider } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Col, Row, Grid } from "react-native-easy-grid";
import {styles, DOMAIN} from './Constant'
import UploadImage from './UploadImage';
import * as firebase from "firebase";
import apiKeys from './config/keys';
import { moderateScale } from "react-native-size-matters";

if (!firebase.apps.length) {
    firebase.initializeApp(apiKeys.firebaseConfig);
}

const db = firebase.firestore();
const statusBarHeight = StatusBar.currentHeight;
const routes = [
    {"Lable":"Profile","id":"Profile","icon":"person"},
    {"Lable":"Inbox","id":"Inbox","icon":"mail"},
    {"Lable":"Rides","id":"MyRidesTab","icon":"car-sport"},
    {"Lable":"Earning","id":"MyEarning","icon":"home"},
    {"Lable":"Documents","id":"Documents","icon":"document"},
    {"Lable":"Bank","id":"Bank","icon":"home"},  
    {"Lable":"Change Password","id":"ChangePassword","icon":"home"},
    {"Lable":"Support","id":"Support","icon":"home"},  
    {"Lable":"ABN","id":"Abn","icon":"home"},
    {"Lable":"Vehicle Details","id":"VehicleDetails","icon":"home"},
    {"Lable":"Comment","id":"Comment","icon":"home"},    
];

export default class SideBar extends Component {
	constructor(props) {
        super(props);
        this.state = {
            name:'',
            avatar:DOMAIN+'images/no-person.png',
            accessTokan:''
        }
    }

    async componentDidMount() {
        setInterval(() => {
            AsyncStorage.getItem('name').then((value) => {
                if(value != '' && value !== null){
                    this.setState({name: value})
                }
            })
            AsyncStorage.getItem('avatar').then((value) => {
                if(value != '' && value !== null){
                    this.setState({avatar: DOMAIN+value})
                }
            })
            AsyncStorage.getItem('accesstoken').then((value) => {
                if(value != '' && value !== null){
                    this.setState({accessTokan:value})
                }
            })
        }, 2000);
    }
  
    openmenu = async (id) =>{
  		if(id === 'logout'){
            await AsyncStorage.getItem('driverId').then((value) => {
                if(value != '' && value !== null){
                    db.collection("driver_locations")
                    .doc(value)
                    .delete()
                }
            })
            await fetch(DOMAIN+'api/driver/offline',{
                method: 'GET',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+this.state.accessTokan
                }
            }).then(function (response) {
                return response.json();
            }).then( (result)=> {
                AsyncStorage.setItem('isOnline', 'false');
            })
  			await AsyncStorage.removeItem('accesstoken');
            await AsyncStorage.removeItem('expires_at');
            await AsyncStorage.removeItem('email');
            await AsyncStorage.removeItem('name');
            await AsyncStorage.removeItem('avatar');
            await AsyncStorage.removeItem('device_token');
            await AsyncStorage.removeItem('countrycode');
            await AsyncStorage.removeItem('phone');
            await AsyncStorage.removeItem('driverId');
  			this.props.navigation.navigate('LoginOtp');
  		}else{
            this.props.navigation.navigate(id)
  		}
    }

    render() {
        return (
            <View style={{background: '#FFFFFF' }}>
                <View style={{height:moderateScale(130),marginTop:statusBarHeight}}>
          	        <Grid  style={{flexDirection: 'row', alignItems: 'center',}}>
          		        <Row size={75}>
          			        <Col size={1}>
          			        </Col>
          			        <Col size={3} style={{flexDirection: 'row', alignItems: 'center',justifyContent:'center', }}>
                                <UploadImage 
                                    imageuri={this.state.avatar} 
                                    onReload={(img) => this.setState({avatar:img})}
                                    width={moderateScale(80)}
                                    height={moderateScale(80)}
                                />
          			        </Col>
          			        <Col size={6}>
                                <Text style={[styles.ubarFont,{color:'#000',fontSize:moderateScale(19),padding:moderateScale(5)}]} >
                                    {this.state.name}
                                </Text>
                                <TouchableWithoutFeedback onPress={()=>this.props.navigation.navigate('EditProfile')}>
                                    <Text style={[styles.ubarFont,{color:'#3f78ba',fontSize:moderateScale(16),paddingLeft:moderateScale(5)}]}>Edit Profile</Text>
                                </TouchableWithoutFeedback>
          			        </Col>
                        </Row>
          	        </Grid>           
                </View>
                <Divider />
                <View style={{height:moderateScale(10)}} />
                <FlatList
                    data={routes}
                    renderItem={({item, index}) => {
                        return (
                            <TouchableOpacity onPress={() => this.openmenu(item.id)}>
                                <View style={{paddingVertical:moderateScale(8),marginLeft:moderateScale(30),flexDirection:'row',alignItems:'center'}}>
                                    <Text style={[styles.ubarFont,{fontSize:moderateScale(18)}]}>{item.Lable}</Text>
                                </View>
                            </TouchableOpacity> 
                        );
                    }}
                />
                <TouchableOpacity onPress={() => this.openmenu('logout')}>
                    <View style={{paddingVertical:moderateScale(7),marginLeft:moderateScale(30),marginTop:moderateScale(25)}}>
                        <Text style={[styles.ubarFont,{fontSize:moderateScale(18)}]}>Logout</Text>
                    </View>
                </TouchableOpacity>
          </View>
        );
    }
}
