import React from 'react';
import {View,ScrollView, Alert, Image, StyleSheet,Text, TouchableHighlight} from 'react-native';
//import {Picker} from '@react-native-picker/picker';
import {  Provider as PaperProvider, Appbar} from 'react-native-paper';
import { stylesdp , styles, theme, DOMAIN} from './Constant';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import { Input } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";
import { AntDesign } from '@expo/vector-icons';
import {Dropdown} from 'react-native-element-dropdown';


export default class EditProfile extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			accessTokan:'',
			spinner:true,
			cities:{},
    		states:{},
    		country:{},
    		vehicle:{},
    		models:{},
    		firstName:'',
    		firstNameError:'',
    		lastName:'',
    		lastNameError:'',
    		stateval:'', 
    		city:'',
    		vehicleMake:'',
    		vehicleModel:'',
    		carNumber:'',
    		stateError:'',
    		cityError:'',
    		errorVehicle:'',
    		errorVehicleModel:'',
    		errorCarNumber:'',
    		mobile:'',
    		mobileError:'',
    		email:'',
    		emailError:'',
    		isProfileUpdate:false,
    		updateMsg:'',
    		countryId:'',
    		phoneCode:'',
    		isDataFetch:false,
    		countryPick:'',
    		countryitem:{},
    		stateItem:{},
    		cityItem:{},
		}


	}
	async componentDidMount() {

		await AsyncStorage.getItem('accesstoken').then((value) => {           
            if(value != '' && value !== null){
                this.setState({
                    accessTokan:value,                    
                });
            }
        })
        await fetch(DOMAIN+'api/driver/profile',{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
        	console.log(result);
        	const data = result.data;
        	this.setState({
                firstName:data.first_name,
                lastName:data.last_name,
                mobile:data.mobile,
                email:data.email,
                spinner:false,
                stateval:data.state_id,
                city:data.city_id,
                countryId:data.country_id,
            });
            this.getState();
	        this.getCity();
	        this.getCountry();
	        this.setState({
	        	isDataFetch:true	
	        })
	        
        })
	}

	async getCity() {
  		fetch(DOMAIN+'api/cities/2',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {
  			//console.log(result);
  				this.setState({
  					cities:result.data});

  				for (let item of result.data) {
  				if(item.id ==  this.state.city){
	  				this.setState({
		  				cityItem:item
		  			},()=>{
		  				console.log(" CITY ITEM ",this.state.cityItem);
		  			});
  				//stateItem
  				}
  			}
		});

		
    }

	async getState (){
		await fetch(DOMAIN+'api/states/13',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {
  			//console.log(result);
  			

  			this.setState({
  				states:result.data
  			});

  			for (let item of result.data) {
  				if(item.id ==  this.state.stateval){
	  				this.setState({
		  				stateItem:item
		  			},()=>{
		  				console.log(" STATE ITEM ",this.state.stateItem);
		  			});
  				//stateItem
  				}
  			}
		});
    }

    async getCountry () {
  		await fetch(DOMAIN+'api/countries',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {  			
  			//console.log(this.state.countryId);
  			this.setState({
  						country:result.data
  					})
  			
  			for (let item of result.data) {

  				if(item.id === this.state.countryId){
  					console.log(item);
  					let str = this.state.mobile;
  					str = str.replace('+'+item.phonecode, "");
  					
  					this.setState({
  						mobile:str,
  						phoneCode:item.phonecode,
  						countryitem:item,
  					})


  				}
  			}
		});
	}

	async submit (){
    	let firstNameError = '';
    	let lastNameError = '';
    	let mobileError = '';
    	let emailError = '';
    	let uperror = true;
    	if(this.state.firstName.trim() == '') {     		
    		 firstNameError = 'Please input your first name.'
    		 uperror = false;
    	}
    	if(this.state.lastName.trim() == '') { 
    		lastNameError = 'Please input your last name.';
    		uperror = false;
    	}
    	if(this.state.mobile.trim() == '') { 
    		mobileError = 'Please input your phone number.';
    		uperror = false;
    	}
    	if(this.state.email.trim() == '') { 
    		emailError = 'Please input your email.';
    		uperror = false;
    	}
    	

    	if(uperror){
    		console.log(this.state.phoneCode)

    		this.setState({spinner:true})
    		await fetch(DOMAIN+'api/driver/profile',{
	            method: 'POST',
	            headers : {
	                'Content-Type': 'application/json',
	                'Accept': 'application/json',
	                'Authorization': 'Bearer '+this.state.accessTokan
	            },
	            body: JSON.stringify({
	 				"first_name" : this.state.firstName,
	 				"last_name" : this.state.lastName,
	 				"email" : this.state.email,	 				
	 				"mobile" : '+'+this.state.phoneCode+this.state.mobile,
	 				"state_id" : this.state.stateval,
	 				"city_id" : this.state.city,
	 				"country_id" : this.state.countryId
	 			})
	 			
	        }).then(function (response) {
	            return response.json();
	        }).then( (result)=> {
	        	this.setState({spinner:false})
	        	//console.log(result);
	        	//const data = result.data;
	        	if(result.status === 1){
		        	this.setState({
		    			isProfileUpdate:true,
		    			updateMsg:result.message
		    		},()=>{
		    			showMessage({
							message: '',
							type: "success",
							renderCustomContent: ()=>{					
								return this.successMessage();
							},
						});
		    		});
		        }
		        if(result.status === 0){
		        	this.setState({
		    			isProfileUpdate:false,
		    			updateMsg:result.message.email
		    		},()=>{
		    			showMessage({
							message: '',
							type: "danger",
							renderCustomContent: ()=>{					
								return this.successMessage();
							},
						});
		    		});
		        }
	        	
	        })

    	}else{
    		console.log('error')
    		this.setState({
    			firstNameError:firstNameError,
                lastNameError :lastNameError,
                mobileError :mobileError,
                emailError :emailError,
    		},()=>{
    			showMessage({
					message: '',
					type: "danger",
					renderCustomContent: ()=>{					
						return this.renderMessages();
					},
				});
    		});
    	}
    }

    successMessage = () =>{
    	return (
    		<View >    			
    			<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.updateMsg}</Text>
    			
      		</View>	
      	);	
    }

    renderMessages = () =>{
    	return (
    		<View >
    			{this.state.firstNameError 
    				? 
    				(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.firstNameError}</Text>)
    				:
	    			(<></>)
      			}
				{this.state.lastNameError 
					? 
					( <Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.lastNameError}</Text>)
					:
					(<></>)
				}
				{this.state.mobileError 
    				? 
    				(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.mobileError}</Text>)
    				:
	    			(<></>)
      			}
				{this.state.emailError 
					? 
					( <Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.emailError}</Text>)
					:
					(<></>)
				}
    		</View>
    	);
    }	


    _renderItem = item => {
   			//console.log("RENDER",item);
            return (
            <View style={styles.item}>
                <Text style={stylesdp.textItem}>{item.nicename}</Text>  
            </View>
            );
        };

     _renderItemState = item => {
   			//console.log("RENDER",item);
            return (
            <View style={stylesstate.item}>
                <Text style={stylesstate.textItem}>{item.name}</Text>  
            </View>
            );
        };


	render(){		
  		return (
  			<>
  				<Spinner
					visible={this.state.spinner}
					color='#FFF'
					overlayColor='rgba(0, 0, 0, 0.5)'
				/>
  				<StatusBar style="auto" />
  				{(this.state.isDataFetch)
  				?	
  				<PaperProvider theme={theme}>
  					<ScrollView keyboardShouldPersistTaps='handled'>
  						<FlashMessage position="top" style={{borderRadius:2,marginTop:-30}}  />
  						<View style={{paddingTop:30,marginLeft:10,marginRight:10}}>
  							<View style={{flexDirection:'row',}}>
								<View style={{flex:1}}>
					        		<Input placeholder='First Name' inputStyle={[styles.inputStyle,{ borderColor : this.state.firstNameError ? 'red' : '#ddd' }]} inputContainerStyle={styles.inputContainerStyle}  value={this.state.firstName} onChangeText={(value) =>{
						        			this.setState({firstName:value},()=>{
					        					if(value == ''){
					        						this.setState({
				        								firstNameError:'Please input first name.'
				        							});
					        					}else{
					        						this.setState({
				        								firstNameError:''
				        							});
					        					}
						        			});
						        		}}
					        			placeholderTextColor="#8c8c8c" 
					        		/>
					          	</View>
								<View style={{flex:1}}>
					           		<Input placeholder='Last Name' inputStyle={[styles.inputStyle,{ borderColor : this.state.lastNameError ? 'red' : '#ddd' }]} inputContainerStyle={styles.inputContainerStyle}   value={this.state.lastName} onChangeText={(value) =>{
							           		this.setState({lastName:value},()=>{
					        					if(value == ''){
					        						this.setState({
				        								lastNameError:'Please input last name.'
				        							});
					        					}else{
					        						this.setState({
				        								lastNameError:''
				        							});
					        					}
							        		});
							        		
							           	}}
					           			placeholderTextColor="#8c8c8c" 
					           		/>
					        	</View>
        					</View>
        					<View style={{flex:1}}>				        		
				        		<Input keyboardType="number-pad" leftIcon={<View style={{flexDirection:'row'}}><Text style={{fontSize:16,marginRight:7,marginTop:2,color:'#8c8c8c'}}>+{this.state.phoneCode}</Text><Text style={{fontSize:20,borderRightWidth: 1,borderColor:'#8c8c8c'}}></Text></View>}
									leftIconContainerStyle={{position:'absolute',left:15,zIndex:1000}} value={this.state.mobile} max={10} 
									onChangeText={(value) => { let num = value.replace(".", '');
								    num = value = value.replace(/^0+/, '');
								     if(isNaN(num)) { }else{
										this.setState({
					  						mobile:value,
					  					})
								     }
								     if(value == ''){
		        						this.setState({
		        							mobileError:'Please input phone number.'
		        						});
		        					}else{
		        						this.setState({
		        							mobileError:''
		        						});
		        					}
								    }
								    }
								  placeholder='Enter Mobile Number' inputStyle={[styles.inputStyle,{paddingLeft:65,fontSize:16,borderColor : this.state.mobileError ? 'red' : '#ddd'}]}
								  inputContainerStyle={[styles.inputContainerStyle]}
								  placeholderTextColor="#8c8c8c"
								  disabled />
				          	</View>
        					<View style={{flex:1}}>
				        		<Input placeholder='Email' inputStyle={[styles.inputStyle,{ borderColor : this.state.emailError ? 'red' : '#ddd' }]} inputContainerStyle={styles.inputContainerStyle}  value={this.state.email} onChangeText={(value) =>{
					        			this.setState({email:value},()=>{
				        					if(value == ''){
				        						this.setState({
			        								emailError:'Please input email.'
			        							});
				        					}else{
				        						this.setState({
			        								emailError:''
			        							});
				        					}
					        			});
					        		}}
				        			placeholderTextColor="#8c8c8c" 
				        			keyboardType='email-address'
				        			disabled
				        		/>
				          	</View>
				          	<View style={[{height: 50,marginBottom:20}]}>
						        	
						       <Dropdown
					            style={stylesstate.dropdown}
					            containerStyle={stylesdp.shadow}
					            placeholderStyle={stylesdp.placeholderStyle}
					            selectedTextStyle={stylesdp.textItem}
					            iconStyle={stylesdp.icon}
					            labelStyle={stylesdp.textItem}
					           	data={this.state.country.length > 0 ? this.state.country : [] } 
					            labelField="nicename"
					            valueField="id"
					            value={this.state.countryitem}
					            onChange={(item) => {	
						        	
						        	this.setState({
						        		phoneCode:item.phonecode,
								       	countryId:item.id,
								       	countryitem:item,
						        	});
						        	console.log(item);
						        }}

							        renderItem={item => this._renderItem(item)}
						            placeholder="Choose Country"
						          	
					            	textError="Error"
					            	alwaysRenderSelectedItem={true}
					            	
					                />

							       
						      	</View>

				          	<View style={[{borderColor : this.state.stateError ? 'red' : '#ddd' }]}>
				          		<Dropdown
					            style={stylesstate.dropdown}
					            containerStyle={stylesstate.shadow}
					            placeholderStyle={stylesstate.placeholderStyle}
					            selectedTextStyle={stylesstate.textItem}
					            iconStyle={stylesstate.icon}
					            labelStyle={stylesstate.textItem}
					           	data={this.state.states.length  > 0 ? this.state.states : [] } 
					            labelField="name"
					            valueField="id"
					            value={this.state.stateItem}
					            onChange={(item) => {	
						        	this.setState({stateval:item.id},()=>{
				        					if(item.id == ''){
				        						this.setState({
				        								stateError:'Please choose state.'
				        							});
				        					}else{
				        						this.setState({
				        								stateError:''
				        							});
				        					}
						        		});
						        		console.log(item);
						        	}}

							        renderItem={item => this._renderItemState(item)}
						            placeholder="Please choose state."
					            	textError="Error"
					            	alwaysRenderSelectedItem={true}
					                />

					        	
			      			</View>
			      			<View style={[{marginTop:20,borderColor : this.state.cityError ? 'red' : '#ddd' ,backgroundColor:'#fff',overflow:'hidden'}]}>
			      				
			      				<Dropdown
					            style={stylesstate.dropdown}
					            containerStyle={stylesdp.shadow}
					            itemContainerStyle={{color:'#000'}}
					            itemTextStyle={{color:'#000',borderColor:'red',borderWidth:1}}
					            placeholderStyle={stylesdp.placeholderStyle}
					            selectedTextStyle={stylesdp.textItem}
					            iconStyle={stylesdp.icon}
					            labelStyle={stylesdp.textItem}
					           	data={this.state.cities.length  > 0 ? this.state.cities : [] } 
					            labelField="name"
					            valueField="id"
					            value={this.state.cityItem}
					            onChange={(item) => {	
						        	
						        	this.setState({city:item.id},()=>{
					        					if(item.id == ''){
					        						this.setState({
					        								cityError:'Please choose city.'
					        							});
					        					}else{
					        						this.setState({
					        								cityError:''
					        							});
					        					}
					        		});
						        	
						        	console.log(item);
						        }}

							        renderItem={item => this._renderItemState(item)}
						            placeholder="Please choose city."
					            	textError="Error"
					            	alwaysRenderSelectedItem={true}
					                />


			      				
					      </View>
  						</View>
  					</ScrollView>
  					<View style={{paddingBottom:20,borderRadius:40,marginLeft:25,marginRight:25}}>
		        	<TouchableHighlight             
						style={styles.contentBtn} onPress={() => {this.submit(); }}>
							<LinearGradient  
								style={styles.priBtn}       
								colors={['#2270b8', '#74c0ee']}
								end={{ x: 1.2, y: 1 }}>          
								<Text style={styles.priBtnTxt}>Update Profile</Text>
							</LinearGradient>
		            </TouchableHighlight>
		        </View>
  				</PaperProvider>
  				:
  				<></>
  				}
  			</>
  		);
  	}		
}	

const styles1 = StyleSheet.create({ 
  pickerIcon: {   
    position: "absolute",
    bottom: 15,
    right: 10,
    fontSize: 20
 },
 });


const stylesstate = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'white',
            padding: 40,
        },
        dropdown: {
            backgroundColor: 'white',
            borderColor:'#ddd',
            borderWidth:1,
            borderRadius:40,
            paddingLeft:20,
            height:55,
            width:'96%',
            marginTop:10,
            fontSize:23,
            color:'#000',

        },
        icon: {
            marginRight: 5,
            width: 33,
            height: 33,
        },
        item: {
            paddingVertical: 17,
            paddingHorizontal: 4,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
             fontSize:23,
              color:'#000'
        },
        textItem: {
            flex: 1,
            fontSize: 23,
            color:'#000',
        },placeholderStyle: {
		    fontSize: 23,
		  },
        shadow: {
            shadowColor: '#000',
            shadowOffset: {
            width: 0,
            height: 1,
            },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
            elevation: 2,
        },
    });