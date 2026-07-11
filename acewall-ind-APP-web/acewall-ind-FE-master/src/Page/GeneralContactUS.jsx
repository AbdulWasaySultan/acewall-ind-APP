
import ContactUs from "./ContctUs";

const GeneralContactUS = () => {
  const topBarTabs = [
    {
      id: 12,
      name: "Home",
      path: "/",
    },
    {
      id: 7,
      name: "More Courses",
      path: "/Courses",
    },
    {
      id: 8,
      name: "Support",
      path: "/Support",
    },
    {
      id: 8,
      name: "ContactUs",
      path: "/ContactUS",
    },
  ];

  return (
    <div >
      <ContactUs />

    </div>
  );
};

export default GeneralContactUS;
