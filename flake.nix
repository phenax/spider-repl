{
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    let
      shell = { pkgs, ... }:
        pkgs.mkShell {
          buildInputs = with pkgs; [
            just
            bun
            nodejs_23
            nodePackages.typescript
            nodePackages.typescript-language-server
          ];

          # PUPPETEER_EXECUTABLE_PATH_chromium = "${pkgs.ungoogled-chromium}/bin/chromium";
          PUPPETEER_EXECUTABLE_PATH_chromium = "${pkgs.brave}/bin/brave";
          PUPPETEER_EXECUTABLE_PATH_firefox = "${pkgs.firefox}/bin/firefox";
        };
    in
    flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = import nixpkgs {
            inherit system;
            config = {
              android_sdk.accept_license = true;
              licenseAccepted = true;
              allowUnfree = true;
            };
          };
        in
        {
          devShells.default = shell { inherit pkgs system; };
        });
}
