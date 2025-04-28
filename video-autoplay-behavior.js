class VideoAutoPlayBehavior {
  static id = "VideoAutoPlayBehavior";

  static isMatch(url, document) {
    return true; // Apply to every page (you could filter Thinkific URLs if you want)
  }

  async* run(ctx) {
    yield ctx.log("⏳ Waiting for Wistia iframe...");

    // Wait for Wistia player iframe to appear
    await ctx.waitForElement('iframe[src*="wistia"]');

    yield ctx.log("✅ Wistia iframe found, attempting to play video...");

    const iframe = document.querySelector('iframe[src*="wistia"]');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ method: "play" }),
        "*"
      );
      yield ctx.log("▶️ Play command sent to Wistia player.");
    } else {
      yield ctx.log("⚠️ Wistia iframe not accessible.");
    }

    // Optionally wait a few seconds to let buffering start
    yield ctx.sleep(5000);

    yield ctx.log("⏳ Waiting for network to become idle...");

    // Wait until network is idle (no active requests for 5 seconds)
    await ctx.waitForNetworkIdle(5000);

    yield ctx.log("✅ Network idle, ready to snapshot and move to next page.");
  }
}

