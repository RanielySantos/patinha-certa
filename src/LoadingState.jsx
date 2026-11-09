import React,{useEffect,useRef} from 'react';
import {ActivityIndicator,Animated,StyleSheet,Text,View} from 'react-native';
export function Processing({label='Processando…'}){
 return <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityLiveRegion="polite" style={s.processing}><ActivityIndicator color="#20594B"/><Text style={s.label}>{label}</Text></View>;
}
export default function AnimalSkeleton(){
 const opacity=useRef(new Animated.Value(.55)).current;
 useEffect(()=>{const animation=Animated.loop(Animated.sequence([Animated.timing(opacity,{toValue:1,duration:850,useNativeDriver:true}),Animated.timing(opacity,{toValue:.55,duration:850,useNativeDriver:true})]));animation.start();return()=>animation.stop();},[]);
 return <View accessibilityRole="progressbar" accessibilityLabel="Carregando animais" style={s.card}><Animated.View importantForAccessibility="no-hide-descendants" style={{opacity}}><View style={s.photo}/><View style={s.details}><View style={[s.line,{width:'48%',height:28}]}/><View style={[s.line,{width:'68%'}]}/><View style={[s.line,{width:'90%'}]}/><View style={[s.line,{width:'80%'}]}/></View></Animated.View><Processing label="Carregando novas histórias…"/></View>;
}
const s=StyleSheet.create({processing:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,padding:16},label:{fontSize:13,color:'#20594B',flexShrink:1,lineHeight:20},card:{backgroundColor:'white',borderRadius:24,overflow:'hidden',borderWidth:1,borderColor:'#E4E8DF'},photo:{height:315,backgroundColor:'#E2E8DF'},details:{padding:24,gap:18},line:{height:14,borderRadius:6,backgroundColor:'#E2E8DF'}});
