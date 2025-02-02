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
            nodejs_23
            nodePackages.typescript
            nodePackages.typescript-language-server
          ];
        };
    in
    flake-utils.lib.eachDefaultSystem
      (system:
        let pkgs = import nixpkgs { inherit system; };
        in {
          devShells.default = shell { inherit pkgs system; };
        });
}
