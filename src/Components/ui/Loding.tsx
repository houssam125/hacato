interface LodeProps {

  textLodeing: string;

}

export const  Lodeing = ({ textLodeing }: LodeProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center ">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">{textLodeing}</p>
        </div>
      </div>
  );
}

