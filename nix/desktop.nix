{
  lib,
  stdenv,
  rustPlatform,
  pkg-config,
  cargo-tauri,
  bun,
  nodejs,
  cargo,
  rustc,
  jq,
  wrapGAppsHook4,
  makeWrapper,
  dbus,
  glib,
  gtk4,
  libsoup_3,
  librsvg,
  libappindicator,
  glib-networking,
  openssl,
  webkitgtk_4_1,
  gst_all_1,
  beastcli,
}:
rustPlatform.buildRustPackage (finalAttrs: {
  pname = "beastcli-desktop";
  inherit (beastcli)
    version
    src
    node_modules
    patches
    ;

  cargoRoot = "packages/desktop/src-tauri";
  cargoLock.lockFile = ../packages/desktop/src-tauri/Cargo.lock;
  buildAndTestSubdir = finalAttrs.cargoRoot;

  nativeBuildInputs = [
    pkg-config
    cargo-tauri.hook
    bun
    nodejs # for patchShebangs node_modules
    cargo
    rustc
    jq
    makeWrapper
  ] ++ lib.optionals stdenv.hostPlatform.isLinux [ wrapGAppsHook4 ];

  buildInputs = lib.optionals stdenv.isLinux [
    dbus
    glib
    gtk4
    libsoup_3
    librsvg
    libappindicator
    glib-networking
    openssl
    webkitgtk_4_1
    gst_all_1.gstreamer
    gst_all_1.gst-plugins-base
    gst_all_1.gst-plugins-good
    gst_all_1.gst-plugins-bad
  ];

  strictDeps = true;

  preBuild = ''
    cp -a ${finalAttrs.node_modules}/{node_modules,packages} .
    chmod -R u+w node_modules packages
    patchShebangs node_modules
    patchShebangs packages/desktop/node_modules

    mkdir -p packages/desktop/src-tauri/sidecars
    cp ${beastcli}/bin/beastcli packages/desktop/src-tauri/sidecars/beastcli-cli-${stdenv.hostPlatform.rust.rustcTarget}
  '';

  # see publish-tauri job in .github/workflows/publish.yml
  tauriBuildFlags = [
    "--config"
    "tauri.prod.conf.json"
    "--no-sign" # no code signing or auto updates
  ];

  # FIXME: workaround for concerns about case insensitive filesystems
  # should be removed once binary is renamed or decided otherwise
  # darwin output is a .app bundle so no conflict
  postFixup = lib.optionalString stdenv.hostPlatform.isLinux ''
    mv $out/bin/BeastCLI $out/bin/beastcli-desktop
    sed -i 's|^Exec=BeastCLI$|Exec=beastcli-desktop|' $out/share/applications/BeastCLI.desktop
  '';

  meta = {
    description = "BeastCLI Desktop App";
    homepage = "https://beastcli.ai";
    license = lib.licenses.mit;
    mainProgram = "beastcli-desktop";
    inherit (beastcli.meta) platforms;
  };
})
