class VideoAutoPlayBehavior {
  static id = "VideoAutoPlayBehavior";

  static isMatch(url, document) {
    return true;
  }

  static init() {
    return {};
  }

  async* run(ctx) {
    yield ctx.log("✅ VideoAutoPlayBehavior started!");

    try {
      // Look for <script type="application/ld+json"> blocks
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));

      let found = false;

      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent);
          if (data && data['contentUrl'] && data['contentUrl'].endsWith('.m3u8')) {
            const m3u8Url = data['contentUrl'];
            found = true;
            yield ctx.log(`🎯 Found video m3u8 URL: ${m3u8Url}`);

            // Create a hidden <video> element to preload
            const video = document.createElement('video');
            video.src = m3u8Url;
            video.preload = "auto";
            video.style.display = "none";
            document.body.appendChild(video);

            // Try to call play()
            try {
              await video.play();
              yield ctx.log("▶️ Video play() triggered successfully.");
            } catch (err) {
              yield ctx.log(`⚠️ play() failed: ${err.message}`);
            }

            break; // Only need the first valid video
          }
        } catch (err) {
          yield ctx.log(`⚠️ Failed to parse JSON-LD: ${err.message}`);
          continue;
        }
      }

      if (!found) {
        yield ctx.log("⚠️ No video m3u8 found on this page.");
      }

      // Sleep to allow buffering
      yield ctx.log("⏳ Waiting 5 seconds to allow video to buffer...");
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Wait for network idle
      yield ctx.log("⏳ Waiting for network idle...");
      await ctx.untilNetworkIdle({ idleTime: 5000, timeout: 60000 });

      yield ctx.log("✅ Network idle, moving on.");

    } catch (err) {
      yield ctx.log(`❌ Error in VideoAutoPlayBehavior: ${err.message}`);
    }
  }
}
