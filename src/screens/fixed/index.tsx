import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TextInput,
  View,
} from 'react-native'
import { get, post } from '../../application/request'
import CustomizeButton from '../../components/customizeButton'
import { RootTabScreenProps, FixedReleases } from '../../application/types'
import Card from './components/card'
import BottomSheet from '../../components/bottomSheet'
import InOrOut from '../../components/inOrOut'
import CustomizeText from '../../components/customizeText'
import { colors, dimension } from '../../application/contants'
import { handleMoneyInput } from '../../application/utils'

export default function Fixed({ navigation }: RootTabScreenProps<'Fixed'>) {
  const [fixedReleases, setFixedReleases] = useState<FixedReleases[]>()
  const [refreshing, setRefreshing] = useState(false)
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false)
  const [titleInput, setTitleInput] = useState<string>()
  const [valueInput, setValueInput] = useState<string>()
  const [input, isInput] = useState(true)

  async function getFixedReleases() {
    setFixedReleases(await get('fixed-releases'))
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    getFixedReleases()
    setRefreshing(false)
  }, [])

  useEffect(() => {
    const update = navigation.addListener('focus', () => {
      getFixedReleases()
    })
    return update
  }, [navigation])

  function resetBottomSheet() {
    setTitleInput('')
    setValueInput('')
    isInput(true)
    setBottomSheetVisible(false)
  }

  function onConfirm() {
    const addRelease: FixedReleases = {
      title: titleInput as string,
      value: handleMoneyInput(valueInput as string),
      input: input,
    }
    post('fixed-releases', JSON.stringify(addRelease))
    fixedReleases ? setFixedReleases([...fixedReleases, addRelease]) : null
    resetBottomSheet()
  }

  const renderBottomSheet = () => {
    return (
      <BottomSheet
        bottomSheetVisible={bottomSheetVisible}
        setBottomSheetVisible={setBottomSheetVisible}
      >
        <InOrOut input={input} isInput={isInput} />
        <CustomizeText style={styles.label} type="medium">
          T??tulo
        </CustomizeText>
        <TextInput
          value={titleInput}
          onChangeText={setTitleInput}
          style={styles.input}
        />
        <CustomizeText style={styles.label} type="medium">
          Valor
        </CustomizeText>
        <TextInput
          value={valueInput}
          onChangeText={setValueInput}
          style={styles.input}
          keyboardType="numeric"
        />
        <CustomizeButton style={styles.buttonModal} onPress={onConfirm}>
          Confirmar
        </CustomizeButton>
      </BottomSheet>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
      >
        {fixedReleases?.map((item) => (
          <Card
            props={item}
            key={item.id}
            onPress={() => navigation.navigate('FixedInfo', { release: item! })}
          />
        ))}
        <CustomizeButton
          add
          style={styles.button}
          onPress={() => setBottomSheetVisible(true)}
        />
      </ScrollView>
      {renderBottomSheet()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
  },
  button: {
    marginVertical: 16,
  },
  label: {
    marginTop: 16,
    fontSize: 16,
    width: '100%',
  },
  input: {
    width: '100%',
    height: dimension.height * 0.04,
    backgroundColor: colors.form,
    padding: 4,
    fontSize: 14,
    fontFamily: 'QuicksandRegular',
    marginTop: 8,
  },
  buttonModal: {
    margin: 24,
  },
})
