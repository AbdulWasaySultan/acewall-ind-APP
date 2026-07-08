// module.exports = {
//   assets: ['./node_modules/@react-native-vector-icons/material-icons/fonts/'],
// };

// module.exports = {
//   dependencies: {
//     'react-native-vector-icons': {
//       platforms: {
//         ios: null, // Prevents autolinking conflicts if manually adding
//       },
//     },
//   },
//   assets: ['../node_modules/react-native-vector-icons/Fonts/'],
// };

module.exports = {
  dependencies: {
    // Prevents auto-linking conflicts since you are handling the plist manually
    "@react-native-vector-icons/material-icons": {
      platforms: {
        ios: null,
      },
    },
    "@react-native-vector-icons/simple-line-icons": {
      platforms: {
        ios: null,
      },
    },
  },
  assets: ["./node_modules/@react-native-vector-icons/common/fonts/"],
};
