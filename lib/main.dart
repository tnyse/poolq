import 'dart:io';

import 'package:admob_flutter/admob_flutter.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:get_storage/get_storage.dart';
// import 'package:poolq/dule/Screen/Home/landingPage.dart';
import 'package:poolq/Provider/AuthProvider.dart';
import 'package:poolq/Provider/homeProvider.dart';
import 'package:provider/provider.dart';
import 'package:rive/rive.dart';

import 'Module/Screen/Auth/Signup.dart';
import 'Module/Screen/Home/HomePage.dart';
import 'Module/Screen/Home/Payment.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  GetStorage.init();


  String? getAppId() {
    if (Platform.isIOS) {
      return 'ca-app-pub-1065880110189655~2487853650';
    } else if (Platform.isAndroid) {
      return 'ca-app-pub-1065880110189655~2487853650';
    }
    return null;
  }



  Provider.debugCheckInvalidValueType = null;
  Admob.initialize(testDeviceIds: [getAppId().toString()]);

  //Assign publishable key to flutter_stripe
  Stripe.publishableKey =
  "pk_test_51HGpOPE84s4AdL4OksgXJg3nSykmnzSroVWyf5AFCrFX6fcpBoOUD3fMhL6K63tUNU9fGHSSsJ7b9abwUcHL4eDw00pXq5W3Mu";

  //Load our .env file that contains our Stripe Secret key
  await dotenv.load(fileName: "assets/.env");

  runApp(MultiProvider(providers: [
    ChangeNotifierProvider<DataProvider>(
      create: (context) => DataProvider(),
    ),
    ChangeNotifierProvider<AuthProvider>(
      create: (context) => AuthProvider(),
    ),
  ], child: MyApp()));
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PoolQ',
      home: Home(),
    );
  }
}

class Home extends StatefulWidget {
  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  @override
  void initState() {
    DataProvider dataProvider =
    Provider.of<DataProvider>(context, listen: false);
    dataProvider.getWeek();
    WidgetsBinding.instance.addPostFrameCallback((_)  {
      Future.delayed(Duration(seconds: 5), () async {
        return decideFirstWidget();
      });

    });




    super.initState();

  }


  Future<dynamic> decideFirstWidget() async {
    User? user = FirebaseAuth.instance.currentUser;

    if (user == null || user == 'null' || user == '') {
      return Navigator.pushAndRemoveUntil(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) {
            return RegisterWidget();
          },
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
        ),
            (route) => false,
      );
    } else {

      return Navigator.pushAndRemoveUntil(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) {
            return HomePage();
              // HomePageWidget();
          },
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
        ),
            (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return  Material(
      child: RiveAnimation.asset(
        'assets/riv/football_intro.riv',
        fit: BoxFit.fitHeight,
      ),
    );
  }
}
