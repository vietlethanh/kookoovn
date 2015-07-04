angular.module('security.info', [])

.factory('securityInfo', [

	function() {
		return {
			apiKey: null,
			currentUser: null,
			currentStore: null/*{
				Active: true,
				Address1: "985 W. Bethany Dr.",
				Address2: "",
				CS_BannerID: 22,
				CS_RegionID: 38,
				CS_StoreID: 4,
				Catering: true,
				City: "Allen",
				CookingClass: false,
				FriendlyName: "",
				Gas: false,
				Giftcard: true,
				IsDeleted: false,
				Latitude: 33.0897454,
				LocationName: "DFW",
				Longitude: -96.684753,
				Loyalty: true,
				Pharmacy: true,
				PharmacyHours: "Mon-Fri: 9am-9pm, Sat: 9am-6pm, Sun: 1pm-6pm",
				PharmacyPhone: "(972) 908-3840",
				PhoneNumber: "(972) 908-3830",
				Region: 0,
				State: "TX",
				StoreHours: "Mon-Sun 6am - 10pm",
				StoreID: 563,
				StoreIconURL: "http://unitedqcadmin.myrelationshop.com/Admin/Images/StoreIcon/02062011010033_ MS_Marker_563.png",
				StoreName: "Market Street",
				StoreServices: "",
				TaxRate: 8.25,
				Zipcode: "75013"
			}*/			
		};
	}
]);