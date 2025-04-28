class VideoAutoPlayBehavior {
  static id = "VideoAutoPlayBehavior";

  static isMatch(url, document) {
    return true; // Apply everywhere
  }

  static init() {
    return {};
  }

  async* run(ctx) {
    yield ctx.log("✅ VideoAutoPlayBehavior started!");

    try {
      // Wait for Wistia iframe using ctx.until
      yield ctx.log("⏳ Waiting for Wistia iframe...");
      await ctx.until(async () => {
        return document.querySelector('iframe[src*="wistia"]');
      }, { timeout: 15000 });

      yield ctx.log("✅ Wistia iframe found, sending play command...");

      // Post play message to Wistia iframe
      const iframe = document.querySelector('iframe[src*="wistia"]');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ method: "play" }),
          "*"
        );
        yield ctx.log("▶️ Play command sent.");
      } else {
        yield ctx.log("⚠️ iframe not accessible, cannot send play command.");
      }

      // Sleep to allow video to buffer
      yield ctx.sleep(5000);

      // Wait for network idle
      yield ctx.log("⏳ Waiting for network idle...");
      await ctx.untilNetworkIdle({ idleTime: 5000, timeout: 60000 });

      yield ctx.log("✅ Network idle, moving on.");

    } catch (err) {
      yield ctx.log(`❌ Error in VideoAutoPlayBehavior: ${err.message}`);
    }
  }
}
