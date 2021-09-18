import React from "react"

import SecurityKeyboard from "./securityKeyboardBase"

class SecurityKeyboardMethods extends SecurityKeyboard {
  constructor(props) {
    super(props)
  }
  
  clear() {
    this.removeAll()
  }
  
  isFocused() {
    if (this.state.cursorLock) {
      return false
    } else {
      return true
    }
  }
  
  blur() {
    this.hide()
  }
  
  focus() {
    this.show()
  }
}
export default SecurityKeyboardMethods
