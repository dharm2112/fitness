package com.squrtsapp

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "SqurtsApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * Called when the activity is created or brought to foreground.
   * Sets window flags so the challenge alarm screen can appear over the lock screen
   * and wake the display when triggered by a notifee full-screen intent.
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    applyWakeFlags()
  }

  override fun onNewIntent(intent: android.content.Intent?) {
    super.onNewIntent(intent)
    // Re-apply flags when activity is re-used (singleTask) from notification tap
    applyWakeFlags()
  }

  private fun applyWakeFlags() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      // API 27+ — use activity-level methods (manifest attrs also set, this is belt-and-braces)
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      // Below API 27 — use deprecated window flags
      @Suppress("DEPRECATION")
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
      )
    }
  }
}
