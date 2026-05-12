import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import StyledView from '../../components/style/StyledView'
import StyledText from '../../components/style/StyledText'

const Garden = () => {
  return (
    <StyledView safe>
      <StyledText type='head1'>Garden</StyledText>
    </StyledView>
  )
}

export default Garden

const styles = StyleSheet.create({})