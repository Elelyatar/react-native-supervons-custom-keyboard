import React, { Component } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Icon,
  TouchableHighlight,
  DeviceEventEmitter,
  Image,
  UIManager,
  findNodeHandle,
  Keyboard,
  Dimensions
} from "react-native"
import styles from "../style/securityKeyboard"
import SecurityKeyboardInput from "./securityKeyboardInput"
import { keyboardJSON } from "../resource/json/keyboard"
import PropTypes from "prop-types"
const { height } = Dimensions.get("window")

class SecurityKeyboard extends Component {
  static propTypes = {
    key: PropTypes.string,
    keyboardHeader: PropTypes.func,
    value: PropTypes.any, //Initial value
    placeholder: PropTypes.string,
    placeholderTextColor: PropTypes.string,
    disabled: PropTypes.bool,
    caretHidden: PropTypes.bool,
    secureTextEntry: PropTypes.bool,
    style: PropTypes.any,
    valueStyle: PropTypes.any,
    cursorStyle: PropTypes.any,
    secureTextStyle: PropTypes.any,
    regs: PropTypes.func, // Verify function
    onChangeText: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.modalVisible = false
    this.upCase = this.props.keyboardType
    this.state = {
      // modalVisible: false, //弹窗锁
      caretHidden: false, //隐藏光标
      secureTextEntry: false, //密码模式
      keyboardType: this.props.keyboardType,
      valueArr: this.props.value || [], //文字,
      currentArr: [],
      //键盘数组
      cursorLock: true //光标锁
    }
    this.numArr = [...keyboardJSON.numArr] //键盘数组
    this.symbolArr = [...keyboardJSON.symbolArr] //键盘数组
    this.stringArr = [...keyboardJSON.stringArr]
    this.stringArrUp = [...keyboardJSON.stringArrUp]
  }

  componentDidMount() {
    let that = this
    //设置密码模式
    this.props.secureTextEntry &&
      this.setState({
        secureTextEntry: true
      })
    this.props.caretHidden &&
      this.setState({
        caretHidden: true
      })
    this.changeKey()
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this._keyboardDidShow
    )
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      this._keyboardDidHide
    )
  }

  _keyboardDidShow = () => {
    this.systemKeyboard = true
  }

  _keyboardDidHide = () => {
    this.systemKeyboard = false
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
  }

  changeKey() {
    this.numArr = this.props.random ? this.shuffle(this.numArr) : this.numArr
    this.setChangeDateNum()
    // currentNumArr.push(...['.', 'del', 'ABC', '!?#']);
    this.stringArr = this.props.random
      ? this.shuffle(this.stringArr)
      : this.stringArr
    // 小写数组转大写69
    const rule = /[a-z]/i
    const stringArrCaps = this.stringArr.map(item => {
      if (rule.test(item)) {
        return item.toLocaleUpperCase()
      }
    })
    this.setChangeDateString(this.stringArr, false)
    // 符号数据
    this.symbolArr = this.props.random
      ? this.shuffle(this.symbolArr)
      : this.symbolArr
    this.setChangeDateSymbol()
    this.stringArrUp = stringArrCaps
    this.setChangeDateString(this.stringArrUp, true)
  }

  shouldComponentUpdate(nextProps, nextState) {
    //去除不必要的渲染
    if (
      this.modalVisible != nextState.modalVisible ||
      this.state.cursorLock != nextState.cursorLock ||
      this.props.disabled != nextProps.disabled
    ) {
      return true
    }
    return false
  }

  //显示键盘
  show() {
    if (this.systemKeyboard) {
      Keyboard.dismiss()
      return
    }
    this.modalVisible = true
    this.setState({
      cursorLock: false
    })
    this.onFocus()
    DeviceEventEmitter.emit("_keyboardDidShow", null);
    // let timer = setTimeout(() => {
    //   UIManager.measure(
    //     findNodeHandle(this.refs.keyboardWrap),
    //     (x, y, widths, heights) => {
    //       DeviceEventEmitter.emit("_keyboardDidShow", {
    //         endCoordinates: {
    //           screenX: 0,
    //           height: 285,
    //           width: widths,
    //           screenY: height - heights
    //         },
    //         isLoadKeyBoard: true
    //       })
    //     }
    //   )
    //   clearTimeout(timer)
    // }, 50)
  }

  hide() {
    this.modalVisible = false
    this.setState({
      cursorLock: true,
      keyboardType: this.props.keyboardType
    })
    this.onBlur()
    DeviceEventEmitter.emit("_keyboardDidHide", null)
  }

  inputEvent(value) {
    DeviceEventEmitter.emit(this.props.keyName || "keyboardListener", value);
    if (value == undefined || value == null) {
      return false
    }
    this.props.onChangeText && this.props.onChangeText(value.join(""))
  }

  onFocus() {
    this.props.onFocus && this.props.onFocus()
  }

  onBlur() {
    this.props.onBlur && this.props.onBlur()
  }

  //Calibration
  regs(valueArr) {
    if (!this.props.regs) {
      return valueArr
    }
    valueArr = this.props.regs(valueArr.join(""))
    valueArr = valueArr.split("")
    return valueArr
  }

  add(value) {
    let valueArr = this.state.valueArr
    valueArr.push(value)
    if (valueArr == "" || valueArr == undefined || valueArr == null) {
      return
    }
    valueArr = this.regs(valueArr)
    this.setState({
      valueArr: valueArr
    })
    this.inputEvent(valueArr)
  }

  remove() {
    let valueArr = this.state.valueArr
    if (valueArr.length == 0) {
      return
    }
    valueArr.pop()
    this.setState({
      valueArr: valueArr
    })
    this.inputEvent(valueArr)
  }

  removeAll() {
    let valueArr = this.state.valueArr
    if (valueArr.length == 0) {
      return
    }
    valueArr = []
    this.setState({
      valueArr: valueArr
    })
    this.inputEvent(valueArr)
  }

  shuffle(a) {
    let len = a.length
    for (let i = 0; i < len - 1; i++) {
      let index = parseInt(Math.random() * (len - i))
      let temp = a[index]
      a[index] = a[len - i - 1]
      a[len - i - 1] = temp
    }
    return a
  }

  addItemImageView(index, itemParent, sty, path, fun, funlong) {
    return (
      <TouchableHighlight
        style={[itemParent, { overflow: "hidden" }]}
        underlayColor="#cccccc"
        key={index}
        onPress={fun}
        onLongPress={funlong}
      >
        {typeof path !== "string" && (
          <Image style={sty} source={path} resizeMode="contain" />
        )}
      </TouchableHighlight>
    )
  }

  addItemTextView(index, parentSty, sty, content, fun) {
    return (
      <TouchableHighlight
        style={parentSty}
        underlayColor="#cccccc"
        key={index}
        onPress={fun}
      >
        <Text style={sty}>{content}</Text>
      </TouchableHighlight>
    )
  }
  setChangeDateNum() {
    let arr = this.props.imageArr

    this.numArr.splice(
      this.numArr.length - 1,
      0,
      arr ? arr.back_image : require("../resource/images/back.png")
    )
    this.numArr.push(
      arr ? arr.delete_image : require("../resource/images/icon-delete.png")
    )
  }

  setChangeDateString(stringArr, isUp) {
    let arr = this.props.imageArr
    if (isUp) {
      stringArr.splice(
        19,
        0,
        arr
          ? arr.transform2_image
          : require("../resource/images/transform2.png")
      )
    } else {
      stringArr.splice(
        19,
        0,
        arr ? arr.transform_image : require("../resource/images/transform.png")
      )
    }
    stringArr.push(
      arr ? arr.delete_image : require("../resource/images/icon-delete.png")
    )
    stringArr.push("123")
    stringArr.push(
      arr ? arr.space_image : require("../resource/images/space.png")
    )
    stringArr.push("#+=")
  }

  setChangeDateSymbol() {
    let arr = this.props.imageArr
    this.symbolArr.push(
      arr ? arr.back_image : require("../resource/images/back.png")
    )
    this.symbolArr.push(
      arr ? arr.space_image : require("../resource/images/space.png")
    )
    this.symbolArr.push(
      arr ? arr.delete_image : require("../resource/images/icon-delete.png")
    )
  }

  renderNum() {
    // Determine the keyboard type
    if (this.state.keyboardType === "number") {
      return this.addOrientationView(this.numArr, 3, this._addNumView)
    } else if (this.state.keyboardType === "string") {
      return this.addOrientationView(this.stringArr, 9, this._addStringView)
    } else if (this.state.keyboardType === "symbol") {
      return this.addOrientationView(this.symbolArr, 9, this._addStringSymbol)
    } else if (this.state.keyboardType === "upString") {
      return this.addOrientationView(this.stringArrUp, 9, this._addStringView)
    }
  }

  addOrientationView(numArr, addNum, verticalView) {
    return numArr.map((item, index) => {
      if (index % addNum == 0) {
        return (
          <View style={styles.orientation} key={index}>
            {verticalView(index, addNum, numArr)}
          </View>
        )
      }
    })
  }

  _addNumView = (flag, addNum, numArr) => {
    return numArr.slice(flag, flag + addNum).map((item, index) => {
      let icon = styles.deleteIcon
      if (flag + index == 9) {
        icon = styles.backIcon
      }
      if (flag + index == 9 || flag + index == 11) {
        return this.addItemImageView(
          index,
          [styles.itemNumParentText, styles.itemNumParentImage],
          icon,
          item,
          () => {
            if (index == 0) {
              this.setState({ keyboardType: this.upCase })
            }
            if (index == 2) {
              this.remove.bind(this)()
            }
          },
          () => {
            if (index == 2) {
              this.removeAll.bind(this)()
            }
          }
        )
      }
      return this.addItemTextView(
        index,
        styles.itemNumParentText,
        styles.numText,
        item,
        this.add.bind(this, item)
      )
    })
  }

  //Render alphabet keyboard
  _addStringView = (flag, addNum, numArr) => {
    // Change the number of columns
    if (flag == 0) {
      addNum++
    }
    if (flag == 9 || flag == 18 || flag == 27) {
      flag++
    }

    return numArr.slice(flag, flag + addNum).map((item, index) => {
      let icon = styles.deleteIcon
      if (flag + index == 19) {
        icon = styles.transformIcon
      }
      if (flag + index == 19 || flag + index == 27) {
        // Set the style of the Convert button and Delete button
        return this.addItemImageView(
          index,
          styles.itemStringParentImage,
          icon,
          item,
          () => {
            if (index == 0) {
              this.upCase =
                this.state.keyboardType == "string" ? "upString" : "string"
              this.setState({ keyboardType: this.upCase })
            }
            if (index == 8) {
              this.remove.bind(this)()
            }
          },
          () => {
            if (index == 8) {
              this.removeAll.bind(this)()
            }
          }
        )
      }
      if (flag + index == 29) {
        // Set space
        return this.addItemImageView(
          index,
          styles.itemStringParentSpace,
          styles.spaceIcon,
          item,
          this.add.bind(this, " ")
        )
      }
      let parent = styles.itemStringParentText
      let text = styles.numText
      if (flag + index == 10) {
        parent = styles.itemStringParentText2
      } // Set the left-hand spacing from the second line
      if (flag + index == 18) {
        parent = styles.itemStringParentText3
      } // Set the spacing to the right of the end of the second line
      if (flag + index == 28 || flag + index == 30) {
        parent = styles.itemStringParentText4 //Set the style of numeric buttons and symbol buttons
        text = styles.symbolText
      }

      return this.addItemTextView(index, parent, text, item, () => {
        if (index + flag == 28) {
          this.setState({ keyboardType: "number" })
        } else if (index + flag == 30) {
          this.setState({ keyboardType: "symbol" })
        } else {
          this.add.bind(this, item)()
        }
      })
    })
  }

  //Rendering symbol keyboard
  _addStringSymbol = (flag, addNum, numArr) => {
    return numArr.slice(flag, flag + addNum).map((item, index) => {
      let parent = styles.itemStringParentText4
      let icon = styles.deleteIcon
      if (flag + index == 28) {
        //Set the style of return key, space and delete key
        parent = styles.itemStringParentSpace
        icon = styles.spaceIcon
      }
      if (flag + index == 27) {
        icon = styles.backIcon
      }

      if (flag == 27) {
        return this.addItemImageView(
          index,
          parent,
          icon,
          item,
          () => {
            if (index == 0) {
              this.setState({ keyboardType: this.upCase })
            }
            if (index == 1) {
              this.add.bind(this, " ")()
            }
            if (index == 2) {
              this.remove.bind(this)()
            }
          },
          () => {
            if (index == 2) {
              this.removeAll.bind(this)()
            }
          }
        )
      }
      return this.addItemTextView(
        index,
        styles.itemStringParentText,
        styles.numText,
        item,
        this.add.bind(this, item)
      )
    })
  }

  render() {
    return (
      <View>
        <SecurityKeyboardInput
          keyName={this.props.keyName}
          disabled={this.props.disabled}
          caretHidden={this.state.caretHidden}
          secureTextEntry={this.props.secureTextEntry}
          value={this.props.value}
          cursorLock={this.state.cursorLock}
          style={this.props.style}
          valueStyle={this.props.valueStyle}
          cursorStyle={this.props.cursorStyle}
          secureTextStyle={this.props.secureTextStyle}
          show={this.show.bind(this)}
          placeholder={this.props.placeholder}
          placeholderTextColor={this.props.placeholderTextColor}
        />
        <Modal
          animationType={"slide"}
          presentationStyle={"overFullScreen"}
          transparent={true}
          visible={this.modalVisible}
          onRequestClose={() => {}}
        >
          <View style={styles.root}>
            <Text
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                backgroundColor: "rgba(0,0,0,0)"
              }}
              onPress={this.hide.bind(this)}
            />
            <View style={styles.keyboardWrap} ref="keyboardWrap">
              <View style={styles.headerWrap}>
                {this.props.keyboardHeader ? (
                  this.props.keyboardHeader()
                ) : (
                  <Image
                    style={styles.headerImage}
                    source={require("../resource/images/text.png")}
                  />
                )}
                <TouchableOpacity
                  onPress={this.hide.bind(this)}
                  style={styles.closeIconWrap}
                >
                  <Image
                    style={styles.closeIcon}
                    source={require("../resource/images/ok.png")}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.lengthwaysClass}>{this.renderNum()}</View>
            </View>
          </View>
        </Modal>
      </View>
    )
  }
}

export default SecurityKeyboard
