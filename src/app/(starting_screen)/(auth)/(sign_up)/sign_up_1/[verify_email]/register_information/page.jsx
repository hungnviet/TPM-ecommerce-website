"use client";
import { useEffect, useState } from "react";
import "./register_information.css";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
const AWS = require("aws-sdk");
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

AWS.config.update({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
});

const cognito = new AWS.CognitoIdentityServiceProvider();

const location = [
  {
    province: "Aichi",
    city: [
      "Anjō",
      "Atsuta",
      "Gamagōri",
      "Handa",
      "Hekinan",
      "Ichinomiya",
      "Inazawa",
      "Kariya",
      "Kasugai",
      "Komaki",
      "Kōnan",
      "Nagoya",
      "Nishio",
      "Okazaki",
      "Seto",
      "Tokoname",
      "Toyohashi",
      "Toyokawa",
      "Toyota",
    ],
  },
  {
    province: "Akita",
    city: ["Noshiro", "Ōdate"],
  },
  {
    province: "Aomori",
    city: ["Aomori", "Hachinohe", "Hirosaki"],
  },
  {
    province: "Chiba",
    city: [
      "Chiba",
      "Chōshi",
      "Funabashi",
      "Ichihara",
      "Ichikawa",
      "Kashiwa",
      "Kisarazu",
      "Matsudo",
      "Narashino",
      "Narita",
      "Noda",
      "Sawara",
      "Urayasu",
    ],
  },
  {
    province: "Ehime",
    city: ["Imabari", "Matsuyama", "Niihama", "Saijō", "Uwajima", "Yawatahama"],
  },
  {
    province: "Fukui",
    city: ["Sabae", "Takefu", "Tsuruga"],
  },
  {
    province: "Fukuoka",
    city: [
      "Iizuka",
      "Kitakyūshū",
      "Kurume",
      "Nōgata",
      "Ōkawa",
      "Ōmuta",
      "Tagawa",
    ],
  },
  {
    province: "Fukushima",
    city: ["Aizu-wakamatsu", "Iwaki", "Kōriyama"],
  },
  {
    province: "Gifu",
    city: ["Gifu", "Kakamigahara", "Ōgaki", "Tajimi", "Takayama", "Toki"],
  },
  {
    province: "Gumma",
    city: [
      "Isesaki",
      "Kiryū",
      "Maebashi",
      "Ōta",
      "Takasaki",
      "Tatebayashi",
      "Tomioka",
    ],
  },
  {
    province: "Hokkaido",
    city: [
      "Asahikawa",
      "Bibai",
      "Chitose",
      "Ebetsu",
      "Hakodate",
      "Iwamizawa",
      "Kitami",
      "Kushiro",
      "Muroran",
      "Nemuro",
      "Noboribetsu",
      "Obihiro",
      "Otaru",
      "Rumoi",
      "Sapporo",
      "Tomakomai",
      "Wakkanai",
      "Yūbari",
    ],
  },
  {
    province: "Hyōgo",
    city: [
      "Akashi",
      "Akō",
      "Amagasaki",
      "Ashiya",
      "Himeji",
      "Itami",
      "Kakogawa",
      "Kawanishi",
      "Kōbe",
      "Miki",
      "Nishinomiya",
      "Takarazuka",
      "Takasago",
    ],
  },
  {
    province: "Ibaraki",
    city: [
      "Hitachi",
      "Hitachinaka",
      "Kitaibaraki",
      "Koga",
      "Mito",
      "Shimodate",
      "Tsuchiura",
      "Tsukuba Science City",
    ],
  },
  {
    province: "Iwate",
    city: ["Kamaishi", "Miyako", "Mizusawa", "Morioka"],
  },
  {
    province: "Kagawa",
    city: ["Marugame", "Sakaide", "Takamatsu"],
  },
  {
    province: "Kagoshima",
    city: ["Kanoya", "Sendai"],
  },
  {
    province: "Kanagawa",
    city: [
      "Atsugi",
      "Chigasaki",
      "Fujisawa",
      "Hadano",
      "Hakone",
      "Hiratsuka",
      "Kamakura",
      "Kawasaki",
      "Miura",
      "Odawara",
      "Sagamihara",
      "Yamato",
      "Yokohama",
      "Yokosuka",
    ],
  },
  {
    province: "Kōchi",
    city: ["Kōchi"],
  },
  {
    province: "Kumamoto",
    city: ["Arao", "Kumamoto", "Minamata", "Yatsushiro"],
  },
  {
    province: "Kyōto",
    city: ["Kyōto", "Maizuru", "Uji"],
  },
  {
    province: "Mie",
    city: ["Ise", "Kuwana", "Matsuzaka", "Suzuka", "Tsu", "Ueno", "Yokkaichi"],
  },
  {
    province: "Miyagi",
    city: ["Ishinomaki", "Kesennuma", "Sendai", "Shiogama"],
  },
  {
    province: "Miyazaki",
    city: ["Miyakonojō", "Miyazaki", "Nichinan", "Nobeoka"],
  },
  {
    province: "Nagasaki",
    city: ["Hirado", "Isahaya", "Nagasaki", "Ōmura", "Sasebo", "Shimabara"],
  },
  {
    province: "Nagasaki",
    city: ["Hirado", "Isahaya", "Nagasaki", "Ōmura", "Sasebo", "Shimabara"],
  },
  {
    province: "Niigata",
    city: ["Jōetsu", "Kashiwazaki", "Nagaoka", "Niigata", "Niitsu", "Sanjō"],
  },
  {
    province: "Ōita",
    city: ["Beppu", "Hita", "Nakatsu", "Ōita", "Saiki", "Usa", "Usuki"],
  },
  {
    province: "Okayama",
    city: ["Kasaoka", "Kurashiki", "Okayama", "Tamano", "Tsuyama"],
  },
  {
    province: "Ōsaka",
    city: [
      "Daitō",
      "Higashiōsaka",
      "Hirakata",
      "Ikeda",
      "Izumiōtsu",
      "Izumisano",
      "Kadoma",
      "Kishiwada",
      "Matsubara",
      "Moriguchi",
      "Neyagawa",
      "Ōsaka",
      "Sakai",
      "Suita",
      "Takatsuki",
      "Toyonaka",
      "Yao",
    ],
  },
  {
    province: "Okinawa",
    city: ["Naha", "Okinawa"],
  },
  {
    province: "Saga",
    city: ["Imari", "Karatsu", "Saga", "Tosu"],
  },
  {
    province: "Saitama",
    city: [
      "Ageo",
      "Asaka",
      "Chichibu",
      "Fukaya",
      "Gyōda",
      "Iruma",
      "Kawagoe",
      "Kawaguchi",
      "Koshigaya",
      "Kumagaya",
      "Saitama",
      "Sōka",
      "Toda",
      "Warabi",
    ],
  },
  {
    province: "Shiga",
    city: ["Hikone", "Ōtsu", "Shigaraki"],
  },
  {
    province: "Shimane",
    city: ["Izumo", "Masuda", "Matsue"],
  },
  {
    province: "Shizuoka",
    city: [
      "Atami",
      "Fuji",
      "Fujieda",
      "Fujinomiya",
      "Gotemba",
      "Hamakita",
      "Hamamatsu",
      "Itō",
      "Mishima",
      "Numazu",
      "Shimada",
      "Shimizu",
      "Shizuoka",
      "Yaizu",
    ],
  },
  {
    province: "Tochigi",
    city: ["Ashikaga", "Kanuma", "Nikkō", "Oyama", "Sano", "Utsunomiya"],
  },
  {
    province: "Tokushima",
    city: ["Anan", "Komatsushima", "Naruto", "Tokushima"],
  },
  {
    province: "Tokyo",
    city: [
      "Chōfu",
      "Fuchū",
      "Ginza",
      "Hachiōji",
      "Higashimurayama",
      "Hino",
      "Kodaira",
      "Koganei",
      "Kokubunji",
      "Machida",
      "Mitaka",
      "Musashino",
      "Ōme",
      "Tachikawa",
      "Tokyo",
    ],
  },
  {
    province: "Tottori",
    city: ["Kurayoshi", "Yonago"],
  },
  {
    province: "Toyama",
    city: ["Takaoka"],
  },
  {
    province: "Wakayama",
    city: ["Kainan", "Nachi-katsuura", "Wakayama"],
  },
  {
    province: "Yamagata",
    city: ["Sakata", "Tsuruoka", "Yamagata", "Yonezawa"],
  },
  {
    province: "Yamaguchi",
    city: [
      "Hagi",
      "Hōfu",
      "Iwakuni",
      "Kudamatsu",
      "Shimonoseki",
      "Tokuyama",
      "Ube",
    ],
  },
];

export default function RegisterInformation({ params }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [address, setAddress] = useState("");
  const [provinceIndex, setProvinceIndex] = useState(0);
  const [cityIndex, setCityIndex] = useState(0);
  const [detailAdress, setDetailAdress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const encodeEmail = params.verify_email;
  const email = decodeURIComponent(encodeEmail);
  const [userid, setUserid] = useState("");

  async function handleSubmit(e) {
    console.log("handleSubmit called");

    e.preventDefault();

    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }

    const userAttributesParams = {
      UserPoolId: process.env.NEXT_PUBLIC_AWS_Userpool_ID,
      Username: email,
      UserAttributes: [
        {
          Name: "given_name",
          Value: firstName,
        },
        {
          Name: "family_name",
          Value: lastName,
        },
        {
          Name: "gender",
          Value: gender,
        },
        {
          Name: "phone_number",
          Value: phoneNumber,
        },
        {
          Name: "address",
          Value: address,
        },
      ],
    };

    cognito.adminUpdateUserAttributes(
      userAttributesParams,
      async function (err, data) {
        if (err) {
          console.error(err.message || JSON.stringify(err));
          return;
        }
        console.log("User information updated");
      }
    );

    const passwordParams = {
      UserPoolId: process.env.NEXT_PUBLIC_AWS_Userpool_ID,
      Username: email,
      Password: password,
      Permanent: true,
    };
    const getUserParams = {
      UserPoolId: process.env.NEXT_PUBLIC_AWS_Userpool_ID, // Your User Pool Id
      Username: email, // The username of the user you want to get
    };
    cognito.adminSetUserPassword(passwordParams, function (err, data) {
      if (err) {
        console.error(err.message || JSON.stringify(err));
        return;
      }
      console.log("User password updated");
    });

    cognito.adminGetUser(getUserParams, async function (err, data) {
      if (err) {
        console.error(err.message || JSON.stringify(err));
        return;
      }
      const userid = data.UserAttributes.find(
        (attr) => attr.Name === "sub"
      ).Value;
      console.log("User ID: ", userid);

      // Fetch request here
      const res = await fetch("/api/user/information", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          User_ID: userid, // Assuming User_ID is the email
          Phone_Number: phoneNumber,
          Email: email,
          Address: [address],
          FName: firstName,
          LName: lastName,
          Date_of_birth: "1/1/2002", // You need to define dateOfBirth
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          toast.success("ユーザー情報が正常に更新されました");
          router.push("/sign_in");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  }

  const handleChangePhoneNumber = (value) => {
    const formattedPhoneNumber = value.startsWith("+") ? value : `+${value}`;
    setPhoneNumber(formattedPhoneNumber);
    setIsPhoneValid(validatePhoneNumber(formattedPhoneNumber));
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneNumberPattern = /^\+\d{1,3}(\d{9,11})$/;
    return phoneNumberPattern.test(phoneNumber);
  };

  useEffect(() => {
    setAddress(
      `${location[provinceIndex].province}, ${location[provinceIndex].city[cityIndex]}, ${detailAdress}`
    );
  }, [provinceIndex, cityIndex, detailAdress]);

  return (
    <div className="register_information_container">
      <ToastContainer />
      <h1>アカウント作成に必要な情報をお知らせください</h1>
      <form className="form_register_information" onSubmit={handleSubmit}>
        <div className="form_register_content">
          <div className="first_block_form_content">
            <div className="left_of_first">
              <div>
                <label>ファーストネーム</label>
                <input
                  type="text"
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label>苗字</label>
                <input
                  type="text"
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div>
                <h4>
                  名前 : {firstName} {lastName}
                </h4>
                <h4>住所: {address}</h4>
                <h4>電話番号 :{phoneNumber}</h4>
                <h4>性別: {gender}</h4>
                <p>情報を正しく確認してください</p>
              </div>
            </div>
            <div className="right_of_first">
              <div>
                <label>電話番号</label>
                <PhoneInput
                  country={"jp"}
                  enableSearch={true}
                  value={phoneNumber}
                  onChange={(phone) => handleChangePhoneNumber(phone)}
                />
                {!isPhoneValid && phoneNumber && (
                  <p className="error">
                    電話番号が無効です。国番号の後に 9～11
                    桁の数字があることを確認してください。
                  </p>
                )}
              </div>
              <div>
                <label>住所</label>
                <div className="selectContainer">
                  <p>州</p>
                  <select
                    value={provinceIndex}
                    onChange={(e) => {
                      setProvinceIndex(e.target.value);
                    }}
                  >
                    {location.map((item, index) => {
                      return (
                        <option key={index} value={index}>
                          {item.province}
                        </option>
                      );
                    })}
                  </select>
                  <p>市</p>
                  <select
                    value={cityIndex}
                    onChange={(e) => {
                      setCityIndex(e.target.value);
                    }}
                  >
                    {location[provinceIndex].city.map((item, index) => {
                      return (
                        <option key={index} value={index}>
                          {item}
                        </option>
                      );
                    })}
                  </select>
                  <p>詳細住所</p>
                  <input
                    type="text"
                    value={detailAdress}
                    onChange={(e) => {
                      setDetailAdress(e.target.value);
                    }}
                  ></input>
                </div>
              </div>
            </div>
          </div>
          <div className="seconde_block_form_content">
            <div className="left_of_second">
              <label>メール</label>
              <p>{email}</p>
            </div>
            <div className="right_of_second">
              <label>性別</label>
              <div className="option_for_gender">
                <div>
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    onChange={(e) => setGender(e.target.value)}
                  ></input>
                  <p>男</p>
                </div>
                <div>
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    onChange={(e) => setGender(e.target.value)}
                  ></input>
                  <p>女性</p>
                </div>
                <div>
                  <input
                    type="radio"
                    name="other"
                    value="Other"
                    onChange={(e) => setGender(e.target.value)}
                  ></input>
                  <p>他の</p>
                </div>
              </div>
            </div>
          </div>
          <div className="third_block_form_content">
            <div className="left_of_third">
              <label>パスワード</label>
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="right_of_third">
              <label>パスワードを認証する</label>
              <input
                type="password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="form_register_btn">
          <button
            type="button"
            className="btn_clear"
            onClick={() => console.log(phoneNumber)}
          >
            クリア
          </button>
          <button className="btn_finish" type="submit">
            仕上げる
          </button>
        </div>
      </form>
    </div>
  );
}
