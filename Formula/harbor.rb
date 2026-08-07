class Harbor < Formula
  desc "A TUI for managing your /etc/hosts seamlessly"
  homepage "https://github.com/piotrzaborow/harbor"
  version "0.1.0"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/piotrzaborow/harbor/releases/download/v0.1.0/harbor-mac-arm"
      # sha256 "PLACEHOLDER_MAC_ARM_SHA256"
    else
      url "https://github.com/piotrzaborow/harbor/releases/download/v0.1.0/harbor-mac-x64"
      # sha256 "PLACEHOLDER_MAC_X64_SHA256"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/piotrzaborow/harbor/releases/download/v0.1.0/harbor-linux-arm"
      # sha256 "PLACEHOLDER_LINUX_ARM_SHA256"
    else
      url "https://github.com/piotrzaborow/harbor/releases/download/v0.1.0/harbor-linux-x64"
      # sha256 "PLACEHOLDER_LINUX_X64_SHA256"
    end
  end

  def install
    # The downloaded file is the executable itself.
    # We just need to rename it to 'harbor' and install it into bin.
    
    # Depending on the architecture, the downloaded filename will differ.
    # But Homebrew downloads the URL into a single file we can just install.
    # Note: Using Dir.glob since the downloaded file might keep its original name 
    # depending on how Homebrew caches it, but normally we can just use `bin.install`.
    
    filename = if OS.mac?
      Hardware::CPU.arm? ? "harbor-mac-arm" : "harbor-mac-x64"
    else
      Hardware::CPU.arm? ? "harbor-linux-arm" : "harbor-linux-x64"
    end

    bin.install filename => "harbor"
  end

  test do
    system "#{bin}/harbor", "--help" # Or whatever command validates it's working
  end
end
