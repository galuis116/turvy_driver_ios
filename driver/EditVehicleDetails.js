import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {  
	Provider as PaperProvider,
	Text, 
	Button, 
	Appbar, 
	Card, 
	Title, 
	Paragraph,
	TouchableRipple,
	Divider 
} from 'react-native-paper';
import {
	View, 
	ScrollView, 
	TouchableWithoutFeedback,
	Image,
	TouchableHighlight, 
	StyleSheet, 
	TouchableOpacity, 
	Dimensions,
} from 'react-native'
import {Picker} from '@react-native-picker/picker';

import {styles, theme, DOMAIN} from './Constant';
import Spinner from 'react-native-loading-spinner-overlay';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import FlashMessage , { showMessage, hideMessage }  from "react-native-flash-message";

import {Dropdown} from 'react-native-element-dropdown';



export default class EditVehicleDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        	driverId:null,
        	spinner:true,
        	accessTokan:'',
        	data:{},
        	isDataFetch:false,
        	vehicle:{},
    		models:{},
    		vehicleMake:'',
    		vehicleModel:'',
    		carNumber:'',
    		carColor:'',
    		carYear:'',
    		vehicleId:'',
    		makeError:'',
			modelError :'',
			plateError:'',
			colorError:'',
			yearError:'',
			vehicleItem:{},
			vehicleItemModel:{},
        }

    }

    async componentDidMount() {
        console.log(this.props)
        await AsyncStorage.getItem('driverId').then((value) => {           
            if(value != '' && value !== null){
                this.setState({
                    driverId:value
                })
            }
        })

        await AsyncStorage.getItem('accesstoken').then((value) => {			
			if(value != '' && value !== null){
				this.setState({
                    accessTokan:value
                })
			}
		})

        fetch(DOMAIN+'api/driver/vehicle-details',{
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+this.state.accessTokan
            }
        }).then(function (response) {
            return response.json();
        }).then( (result)=> {
            //console.log(result);
            this.setState({
                spinner:false,
                data:result.data,
                isDataFetch:true,
                vehicleId:result.data.id,
                vehicleMake:result.data.make_id,
                vehicleModel:result.data.model_id,
                carNumber:result.data.plate,
                carColor:result.data.color,
    			carYear:result.data.year,
            },() => {
            	this.getModels(result.data.make_id)
            })
        })

        this.getVehicle();
    }

    async getVehicle(){

  		fetch(DOMAIN+'api/makes',{
			method: 'GET',
 		}).then(function (response) {
 			return response.json();
  		}).then( (result)=> {
  			//console.log('Make:',result);
			this.setState({
				vehicle:result.data
			});
			
			for (let item of result.data) {
				
  				if(item.id ==  this.state.vehicleMake){
  					
	  				this.setState({
		  				vehicleItem:item
		  			},()=>{
		  				console.log(" Vehicle ITEM ",this.state.vehicleItem);
		  			});
  				//stateItem
  				}
  			}
		});
	}

	async getModels(id) {
		if(id > 0){
	    	fetch(DOMAIN+'api/models/'+id,{
				method: 'GET'
	 		}).then(function (response) {
	 			return response.json();
	  		}).then( (result)=> {
	  			//console.log('Model:',result);
	  			this.setState({
	  				models:result.data
	  			});

	  			for (let item of result.data) {
				
	  				if(item.id ==  this.state.vehicleModel){
	  					
			  				this.setState({
				  				vehicleItemModel:item
				  			},()=>{
				  				console.log(" MODEL ITEM ",this.state.vehicleItemModel);
				  			});
		  				//stateItem
		  				}
		  			}

			});
		}
    }

    async submit(){
    	//console.log('update')    	
    	

    	let makeError = '', modelError = '', plateError = '', colorError = '', yearError = '', isError=false;

    	if(this.state.vehicleMake == '') { 
    		 makeError = 'Please input vehicle make.'
    		 isError=true;
    	}
    	if(this.state.vehicleModel == '') { 
    		 modelError = 'Please input vehicle model.'
    		 isError=true;
    	}
    	if(this.state.carNumber.trim() == '') { 
    		 plateError = 'Please input vehicle plate number.'
    		 isError=true;
    	}
    	if(this.state.carColor.trim() == '') { 
    		 colorError = 'Please input vehicle color.'
    		 isError=true;
    	}
    	if(this.state.carYear.trim() == '') { 
    		 yearError = 'Please input vehicle year.'
    		 isError=true;
    	}

    	

    	if(isError){
    		this.setState({
				makeError:makeError,
				modelError :modelError,
				plateError:plateError,
				colorError:colorError,
				yearError:yearError
			},()=>{
				console.log(this.state.yearError)
				this.refs.vehicleError.showMessage({
	       			message: '',
	       			type: "danger",
	       			renderCustomContent: ()=>{           	 		
	       				return this.renderMessages();
	       			},
	    	 	});
			})
    		
    	}else{
    		this.setState({spinner:true})    		
	    	fetch(DOMAIN+'api/driver/vehicle/'+this.state.vehicleId+'/update',{
	            method: 'POST',
	            headers : {
	                'Content-Type': 'application/json',
	                'Accept': 'application/json',
	                'Authorization': 'Bearer '+this.state.accessTokan
	            },
	            body: JSON.stringify({
	            	make_id: this.state.vehicleMake,
	            	model_id: this.state.vehicleModel,
	            	plate: this.state.carNumber,
	            	color: this.state.carColor,
	            	year: this.state.carYear,
	            })
	        }).then(function (response) {
	            return response.json();
	        }).then( (result)=> {
	            //console.log(result);
	            this.setState({spinner:false})
	            if(result.status === 1){
	            	this.props.navigation.replace('VehicleDetails')
	            }
	        })
	    }
    }

    renderMessages = () =>{
    	console.log(this.state.yearError)
    	return (
    		<View >
    			{
    				this.state.makeError 
    				? 
    				(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.makeError}</Text>)
    				:
	    			(<></>)
      			}
      			{
    				this.state.modelError 
    				? 
    				(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.modelError}</Text>)
    				:
	    			(<></>)
      			}
      			{
    				this.state.plateError 
    				? 
    				(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.plateError}</Text>)
    				:
	    			(<></>)
      			}
      			{
    				this.state.colorError 
    				? 
    				(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.colorError}</Text>)
    				:
	    			(<></>)
      			}
      			{
    				this.state.yearError 
    				? 
    				(<Text style={{color:'#fff',padding:3,fontFamily: "Metropolis-Regular"}}><AntDesign name="closecircle" size={15} color="white" /> {this.state.yearError}</Text>)
    				:
	    			(<></>)
      			}
    		</View>
    	);
    }	

     _renderItemState = item => {
   			//console.log("RENDER",item);
            return (
            <View style={stylesstate.item}>
                <Text style={stylesstate.textItem}>{item.name}</Text>  
            </View>
            );
        };


    render() {
        //console.log(this.state.data)
        const info = this.state.data
        return (
            <>
                <Spinner
                    visible={this.state.spinner}
                    color='#FFF'
                    overlayColor='rgba(0, 0, 0, 0.5)'
                />
                <Appbar.Header style={{backgroundColor:'#FFF'}}>
                    <AntDesign 
                    	name="arrowleft" 
                    	size={24} 
                    	color="black" 
                    	style={{paddingLeft:10}} 
                    	onPress={()=>this.props.navigation.replace('VehicleDetails')} 
                    />
                    <Appbar.Content 
                    	title="Edit Vehicle" 
                    	titleStyle={{textAlign:'center',alignContent:'center'}} 
                    />
                    <AntDesign 
                    	name="edit" 
                    	size={24} 
                    	color="transparent" 
                    	style={{paddingRight:15}}
                    />
                </Appbar.Header>  
                <FlashMessage ref="vehicleError" position="top" style={{marginTop:60}}  />
                {(info)
            	?
                <PaperProvider theme={theme}> 
                    <ScrollView keyboardShouldPersistTaps='handled' style={{ backgroundColor: "#FFF"}}>
                    	
                    	<View style={[styles.pickerContainer,{marginTop:20,borderColor : this.state.errorVehicle ? 'red' : '#ddd' }]}>

                    		<Dropdown
					            style={stylesstate.dropdown}
					            containerStyle={stylesstate.shadow}
					            placeholderStyle={stylesstate.placeholderStyle}
					            selectedTextStyle={stylesstate.textItem}
					            iconStyle={stylesstate.icon}
					            labelStyle={stylesstate.textItem}
					           	data={this.state.vehicle.length  > 0 ? this.state.vehicle : [] } 
					            labelField="name"
					            valueField="id"
					            value={this.state.vehicleItem}
					            onChange={(item) => {	
									console.log(item);
						        	this.setState({
										vehicleMake:item.id,
										vehicleModel:'',
										vehicleItem:item
									},()=>{
										this.getModels(item.id)
					        		});		

						        		
						        }}

							        renderItem={item => this._renderItemState(item)}
						            placeholder="Select Vehicle"
					            	textError="Error"
					            	alwaysRenderSelectedItem={true}
					                />


		        			{ /* <Picker style={{ height: 55, width: '100%',backgroundColor: "transparent",color:'#8c8c8c',overflow:'hidden'}} 
			        			mode="dialog" 
			        			placeholder="Select Vehicle"
								selectedValue={this.state.vehicleMake} 
								onValueChange={(itemValue, itemIndex) => {
									this.setState({
										vehicleMake:itemValue,
										vehicleModel:''
									},()=>{
										this.getModels(itemValue)
					        		});			        		
						 		}}
						 		itemStyle={{marginTop:-80,}}
							>
				        		<Picker.Item label="Select Vehicle" value="" />
				        		{this.state.vehicle.length > 0 && 
								this.state.vehicle.map((val, index) =>{
	            				return ( <Picker.Item key={index} label={val.name} value={val.id} />)
	            				})}
			      			</Picker>
			      			<AntDesign name="down" size={24} color="#a7a7a7" style={styles1.pickerIcon}  /> 
			      		*/ }
		      			</View>

		      			<View style={[styles.pickerContainer,{marginTop:20,borderColor : this.state.errorVehicleModel ? 'red' : '#ddd' }]}>
		        			
		      				<Dropdown
					            style={stylesstate.dropdown}
					            containerStyle={stylesstate.shadow}
					            placeholderStyle={stylesstate.placeholderStyle}
					            selectedTextStyle={stylesstate.textItem}
					            iconStyle={stylesstate.icon}
					            labelStyle={stylesstate.textItem}
					           	data={this.state.models.length  > 0 ? this.state.models : [] } 
					            labelField="name"
					            valueField="id"
					            value={this.state.vehicleItemModel}
					            onChange={(item) => {	
									console.log(item);
						        	this.setState({vehicleModel:item.id,
						        		vehicleItemModel:item
						        	});	
						        }}
						        renderItem={item => this._renderItemState(item)}
					            placeholder="Select Vehicle Model"
				            	textError="Error"
				            	alwaysRenderSelectedItem={true}
					          />

		        			{ /* <Picker 
		        				style={{ height: 55, width: '100%',backgroundColor: "transparent",color:'#8c8c8c',overflow:'hidden' }} 
		        				mode="dialog" 
		        				placeholder="Select Vehicle Model" 
		        				selectedValue={this.state.vehicleModel} 
		        				onValueChange={(itemValue, itemIndex) => {
		        					console.log('makeValur',itemValue)
		        					this.setState({vehicleModel:itemValue});
		        				}}
		        				itemStyle={{marginTop:-80,}}
		        			>
			        			<Picker.Item label="Select Vehicle Model" value="" />
			        			{this.state.models.length > 0 && 
			        			this.state.models.map((val, index)=> { 
			        				return(<Picker.Item key={index} label={val.name} value={val.id} />)
			        			})
			        			}
			      			</Picker>
			      			<AntDesign name="down" size={24} color="#a7a7a7" style={styles1.pickerIcon}  />
			      		*/ }
		      			</View>
		      			<Input 
		      				placeholder='Plate Number' 
		      				inputStyle={[styles.inputStyle,{ marginTop:20, borderColor : this.state.errorCarNumber ? 'red' : '#ddd' }]} 
		      				inputContainerStyle={styles.inputContainerStyle} 
		      				value={this.state.carNumber} 
		      				onChangeText={(value) =>{
     		 					this.setState({carNumber:value});
     		 				}}
     		 				placeholderTextColor="#8c8c8c"  
     		 			/>
     		 			<Input 
		      				placeholder='Color' 
		      				inputStyle={[styles.inputStyle,{borderColor : this.state.errorCarNumber ? 'red' : '#ddd' }]} 
		      				inputContainerStyle={styles.inputContainerStyle} 
		      				value={this.state.carColor} 
		      				onChangeText={(value) =>{
     		 					this.setState({carColor:value});
     		 				}}
     		 				placeholderTextColor="#8c8c8c"  
     		 			/>
     		 			<Input 
		      				placeholder='Year' 
		      				inputStyle={[styles.inputStyle,{borderColor : this.state.errorCarNumber ? 'red' : '#ddd' }]} 
		      				inputContainerStyle={styles.inputContainerStyle} 
		      				value={this.state.carYear} 
		      				onChangeText={(value) =>{
     		 					this.setState({carYear:value});
     		 				}}
     		 				placeholderTextColor="#8c8c8c"  
     		 			/>                    	
                    	<View style={{paddingBottom:20,borderRadius:40,marginLeft:15,marginRight:15}}>
				        	<TouchableHighlight             
				              style={styles.contentBtn} onPress={() => {this.submit(); }}>
				              <LinearGradient  
				                  style={styles.priBtn}       
				                  colors={['#2270b8', '#74c0ee']}
				                  end={{ x: 1.2, y: 1 }}>          
				                    <Text style={styles.priBtnTxt}>Update Vehicle</Text>          
				              </LinearGradient>
				            </TouchableHighlight>
				        </View>
                    </ScrollView>
                </PaperProvider>
                :
	        	<View></View>
	        	}
            </>
        );
    }            

}

const pageStyles = StyleSheet.create({
	infoOuter:{
		marginBottom:20
	},
	lable:{
		fontSize:20,
		color:'#a4a4ac',
		marginBottom:5
	},
	val:{
		fontSize:20,
		color:'#000'
	}

})
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