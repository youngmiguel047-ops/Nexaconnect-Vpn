package com.antares.vpn;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AntaresVpnPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
