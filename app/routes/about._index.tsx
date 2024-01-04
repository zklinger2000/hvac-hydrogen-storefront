import {MetaFunction} from '@shopify/remix-oxygen';

export const meta: MetaFunction = () => {
  return [{title: `PG HVAC Parts | About us`}];
};

export default function About() {
  return (
    <div className="content-grid bg-base-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl my-6 font-bold text-neutral">About Us</h1>
          <p className="prose text-neutral">
            PG HVAC Parts is a family-run business that has been serving the
            HVAC industry for over a decade. We are not a wholesale distributor,
            but rather a salvage operation for both new and used HVAC parts and
            equipment.
            <br /> Anything we sell marked "New" is a new, unused item that may
            or may not have a box. We gaurantee the item is in new condition.
            <br /> Anything we sell marked "Used" was removed, in working order,
            during routine maintenance. We gaurantee the item was in operation
            at the time of salvage.
            <br />
            Our location is in the heart of the Elkhorn Valley in Hooper, NE. We
            specialize in selling HVAC parts and equipment to licensed
            contractors, but we also cater to the general public.
          </p>
        </div>
        <div className="flex flex-col justify-center">
          <img src="/pg-hvac-parts_banner_001.png" alt="warehouse" />
        </div>
      </div>
      <div className="h-8" />
    </div>
  );
}
